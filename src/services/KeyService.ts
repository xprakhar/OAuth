import { Collection, Document, InsertOneResult } from 'mongodb';
import { inject, injectable } from 'inversify';
import {
  createPrivateKey,
  createPublicKey,
  generateKeyPair,
  KeyObject,
  randomUUID,
} from 'node:crypto';
import { JSONWebKeySet, JWK } from 'jose';
import { MongoConnection } from '../utils/mongo-connection';
import { parseDuration } from '../utils/utilities';
import { TYPES } from '../inversify-types';
import { AUTH_KEYS } from '../constants/AUTH_KEYS';
import { DB } from '../constants/DB';
import { IRepository } from './IRepository';

export interface KeyPair {
  kid: string;
  publicKey: KeyObject;
  privateKey: KeyObject;
}

interface KeyDocument extends Document {
  _id: string;
  publicKey: string;
  privateKey: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface IKeyService extends IRepository<KeyDocument> {
  save(keys: {
    publicKey: string;
    privateKey: string;
  }): Promise<InsertOneResult<KeyDocument>>;

  getJWKS(): Promise<JSONWebKeySet | null>;

  getKeyPair(): Promise<KeyPair>;

  getKeysByID(kid: string): Promise<KeyPair | null>;
}

@injectable()
export class KeyService implements IKeyService {
  private keysCollection: Collection<KeyDocument>;

  constructor(@inject(TYPES.MongoConnection) conn: MongoConnection) {
    this.keysCollection = conn.getCollection(DB.AuthKeysCollection);
  }

  async save(keys: { publicKey: string; privateKey: string }) {
    return this.keysCollection.insertOne({
      _id: randomUUID() as string,
      publicKey: keys.publicKey,
      privateKey: keys.privateKey,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + parseDuration(AUTH_KEYS.MaxAge)),
    });
  }

  async findById(id: string) {
    return this.keysCollection.findOne({ _id: id });
  }

  async getJWKS() {
    const cursor = await this.keysCollection
      .find()
      .project<{ _id: string; publicKey: string }>({ publicKey: true });

    const keys: JWK[] = [];
    for await (const { _id: kid, publicKey: publicKeyPem } of cursor) {
      const jwk = createPublicKey({
        key: publicKeyPem,
        type: 'spki',
        format: 'pem',
      }).export({ format: 'jwk' }) as JWK;

      jwk.kid = kid;

      keys.push(jwk);
    }

    cursor.close();

    return keys.length ? { keys } : null;
  }

  async getKeysByID(kid: string) {
    const keyDoc = await this.keysCollection.findOne({ _id: kid });
    if (!keyDoc) return null;

    return {
      kid: keyDoc._id,
      publicKey: createPublicKey({
        key: keyDoc.publicKey,
        format: 'pem',
        type: 'spki',
      }),
      privateKey: createPrivateKey({
        key: keyDoc.privateKey,
        format: 'pem',
        type: 'pkcs8',
        passphrase: process.env.PASSPHRASE,
      }),
    };
  }

  async getKeyPair() {
    try {
      const keyPair = await this.keysCollection.findOne({
        expiresAt: { $gt: new Date() },
      });

      if (!keyPair) {
        const newKeyPair = await new Promise<{
          publicKey: string;
          privateKey: string;
        }>((resolve, reject) => {
          generateKeyPair(
            'rsa',
            {
              modulusLength: 2048,
              publicKeyEncoding: {
                type: 'spki',
                format: 'pem',
              },
              privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.PASSPHRASE,
              },
            },
            (err, publicKey, privateKey) => {
              if (err) reject(err);
              else resolve({ publicKey, privateKey });
            },
          );
        });

        const { insertedId } = await this.save(newKeyPair);

        const privateKeyObject = createPrivateKey({
          key: newKeyPair.privateKey,
          format: 'pem',
          passphrase: process.env.PASSPHRASE,
        });
        const publicKeyObject = createPublicKey({
          key: newKeyPair.publicKey,
          format: 'pem',
        });

        return {
          kid: insertedId,
          privateKey: privateKeyObject,
          publicKey: publicKeyObject,
        };
      } else {
        // If an active key pair already exists, convert PEM to KeyObject
        const privateKeyObject = createPrivateKey({
          key: keyPair.privateKey,
          format: 'pem',

          passphrase: process.env.PASSPHRASE,
        });
        const publicKeyObject = createPublicKey({
          key: keyPair.publicKey,
          format: 'pem',
        });

        return {
          kid: keyPair._id,
          privateKey: privateKeyObject,
          publicKey: publicKeyObject,
        };
      }
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }

  async updateById(id: string, doc: Partial<KeyDocument>) {
    return this.keysCollection.updateOne(
      { _id: id },
      { $set: doc },
      { upsert: true },
    );
  }

  async deleteById(id: string) {
    return this.keysCollection.deleteOne({ _id: id });
  }
}
