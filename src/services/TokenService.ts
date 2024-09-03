import { TextEncoder, TextDecoder } from 'node:util';
import { randomUUID } from 'node:crypto';
import { Collection, Document, MongoServerError } from 'mongodb';
import {
  compactDecrypt,
  CompactEncrypt,
  decodeProtectedHeader,
  JWTPayload,
  jwtVerify,
  SignJWT,
} from 'jose';
import { inject, injectable } from 'inversify';
import { TYPES } from '../inversify-types';
import { MongoConnection } from '../utils/mongo-connection';
import { logger } from '../utils/winston-logger';
import type { IUserService } from './UserService';
import type { IKeyService } from './KeyService';
import { JWT } from '../constants/JWT';
import { DB } from '../constants/DB';
import {
  JWEDecryptionFailed,
  JWSSignatureVerificationFailed,
  JWTClaimValidationFailed,
} from 'jose/errors';
import { parseDuration } from '../utils/utilities';
import { REFRESH_TOKEN } from '../constants/REFRESH_TOKEN';

export interface ITokenService {
  issueJWT(userId: string, opts: { encrypted: boolean }): Promise<string>;
  verifyJWT(jwt: string): Promise<boolean>;
  revokeJWT(reason: string, jwt: string): Promise<void>;
  issueRT(userId: string): Promise<string>;
  revokeRT(rt: string): Promise<void>;
  refresh(rt: string): Promise<string>;
}

interface BlacklistDocument extends Document {
  _id: string;
  reason: string;
  revokedAt: Date;
  expiresAt: Date;
}

interface TokenDocument extends Document {
  _id: string;
  userId: string;
  status: 'active' | 'revoked';
  createdAt: Date;
  expiresAt: Date;
}

@injectable()
export class TokenService implements ITokenService {
  private userService: IUserService;
  private keyService: IKeyService;
  private blacklist: Collection<BlacklistDocument>;
  private token: Collection<TokenDocument>;

  constructor(
    @inject(TYPES.MongoConnection) connection: MongoConnection,
    @inject(TYPES.UserService) userService: IUserService,
    @inject(TYPES.KeyService) keyService: IKeyService,
  ) {
    this.token = connection.getCollection<TokenDocument>(
      DB.RefreshTokenCollection,
    );
    this.blacklist = connection.getCollection<BlacklistDocument>(
      DB.BlacklistCollection,
    );
    this.userService = userService;
    this.keyService = keyService;
  }

  private async jwtPreprocess(jwt: string): Promise<JWTPayload> {
    const { kid, typ } = decodeProtectedHeader(jwt);
    if (!kid) throw new Error('Missing key ID in JWT header');

    const keyPair = await this.keyService.getKeysByID(kid);
    if (!keyPair) throw new Error('Invalid key ID, no matching key found');

    let token = jwt;
    if (typ === 'JWE') {
      const { plaintext: decrypted } = await compactDecrypt(
        jwt,
        keyPair.privateKey,
        {
          contentEncryptionAlgorithms: ['A256GCM'],
        },
      );
      token = new TextDecoder().decode(decrypted);
    }

    const { payload } = await jwtVerify(token, keyPair.publicKey, {
      typ: 'JWT',
      algorithms: ['RS256'],
      issuer: JWT.Issuer,
      audience: JWT.Audience,
      maxTokenAge: JWT.MaxAge,
      clockTolerance: 60,
      requiredClaims: ['jti', 'exp', 'sub'],
    });

    return payload;
  }

  async issueJWT(
    userId: string,
    opts: { encrypted: boolean },
  ): Promise<string> {
    const keys = await this.keyService.getKeyPair();
    const { kid, privateKey } = keys;

    const jwt = await new SignJWT()
      .setAudience(JWT.Audience)
      .setIssuer(JWT.Issuer)
      .setIssuedAt()
      .setExpirationTime(JWT.MaxAge)
      .setJti(randomUUID())
      .setSubject(userId)
      .setProtectedHeader({ kid, alg: 'RS256', typ: 'JWT' })
      .sign(privateKey);

    if (opts.encrypted) {
      return new CompactEncrypt(new TextEncoder().encode(jwt))
        .setProtectedHeader({
          typ: 'JWE',
          cty: 'JWT',
          alg: 'RSA-OAEP',
          enc: 'A256GCM',
          kid,
        })
        .encrypt(keys.publicKey);
    }

    return jwt;
  }

  async verifyJWT(jwt: string): Promise<boolean> {
    try {
      const payload = await this.jwtPreprocess(jwt);
      const blacklisted = await this.blacklist.findOne({ _id: payload.jti });
      if (blacklisted) {
        logger.warn('Token is revoked [verifyJWT: failed]');
        return false;
      }

      const user = await this.userService.findById(payload.sub as string);
      if (!user) {
        logger.warn('Invalid user ID in token [verifyJWT: failed]');
        return false;
      }

      logger.info('Token verified successfully [verifyJWT: success]');
      return true;
    } catch (error) {
      this.handleError(error, 'verifyJWT');
      return false;
    }
  }

  async revokeJWT(reason: string, jwt: string): Promise<void> {
    try {
      const payload = await this.jwtPreprocess(jwt);
      await this.blacklist.updateOne(
        { _id: payload.jti as string },
        {
          $set: {
            reason,
            revokedAt: new Date(),
            expiresAt: new Date(payload.exp as number),
          },
        },
        { upsert: true },
      );

      logger.info('Token revoked successfully [revokeJWT: success]');
    } catch (error) {
      this.handleError(error, 'revokeJWT');
    }
  }

  async issueRT(userId: string): Promise<string> {
    const tokenId = randomUUID();
    const { kid, publicKey } = await this.keyService.getKeyPair();

    const token = await new CompactEncrypt(new TextEncoder().encode(tokenId))
      .setProtectedHeader({
        typ: 'JWE',
        alg: 'RSA-OAEP',
        enc: 'A256GCM',
        kid,
      })
      .encrypt(publicKey);

    await this.token.insertOne({
      _id: tokenId,
      userId,
      status: 'active',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + parseDuration(REFRESH_TOKEN.MaxAge)),
    });

    return token;
  }

  private async preprocessRT(jwe: string): Promise<string> {
    const { kid } = decodeProtectedHeader(jwe);
    if (!kid) throw new Error('Missing key ID in token header');

    const keyPair = await this.keyService.getKeysByID(kid);
    if (!keyPair) throw new Error('Invalid key ID, no matching key found');

    const { plaintext } = await compactDecrypt(jwe, keyPair.privateKey);
    return new TextDecoder().decode(plaintext);
  }

  async revokeRT(rt: string): Promise<void> {
    try {
      const tokenId = await this.preprocessRT(rt);
      await this.token.updateOne(
        { _id: tokenId },
        { $set: { status: 'revoked' } },
      );

      logger.info('Refresh token revoked successfully [revokeRT: success]');
    } catch (error) {
      this.handleError(error, 'revokeRT');
    }
  }

  async refresh(rt: string): Promise<string> {
    try {
      const tokenId = await this.preprocessRT(rt);
      const tokenDoc = await this.token.findOne({ _id: tokenId });

      if (!tokenDoc) throw new Error('Refresh token not found');
      if (tokenDoc.status === 'revoked')
        throw new Error('Refresh token is revoked');
      if (new Date() > tokenDoc.expiresAt)
        throw new Error('Refresh token has expired');

      const newJWT = await this.issueJWT(tokenDoc.userId, { encrypted: true });
      return newJWT;
    } catch (error) {
      Error.captureStackTrace(error as Error);
      console.error(error);
      this.handleError(error, 'refresh');
      throw new Error('Failed to refresh token');
    }
  }

  private handleError(error: unknown, context: string): void {
    if (
      error instanceof JWEDecryptionFailed ||
      error instanceof JWSSignatureVerificationFailed ||
      error instanceof JWTClaimValidationFailed
    ) {
      logger.warn(`${error.message} [${context}: failed]`);
    } else if (error instanceof MongoServerError) {
      logger.error(`MongoDB error: ${error.errmsg} [${context}: failed]`);
    } else if (error instanceof Error) {
      logger.error(`${error.message} [${context}: failed]`);
    } else {
      logger.error('An unknown error occurred [${context}]');
    }
  }
}
