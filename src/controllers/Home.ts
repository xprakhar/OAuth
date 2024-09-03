import type { Request, Response } from 'express';
import {
  controller,
  httpGet,
  httpPost,
  request,
  response,
} from 'inversify-express-utils';
import { ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';
import { MongoServerError } from 'mongodb';
import { signupSchema } from '../schemas/SignupSchema';
import { TYPES } from '../inversify-types';
import { inject } from 'inversify';
import { loginSchema } from '../schemas/LoginSchema';
import { refreshTokenSchema, logoutSchema } from '../schemas/TokenSchema'; // Import schemas
import type { IUserService } from '../services/UserService';
import type { ITokenService } from '../services/TokenService';

@controller('/')
export class Home {
  private userService: IUserService;
  private tokenService: ITokenService;

  constructor(
    @inject(TYPES.UserService) userService: IUserService,
    @inject(TYPES.TokenService) tokenService: ITokenService,
  ) {
    this.userService = userService;
    this.tokenService = tokenService;
  }

  @httpGet('greet')
  async greet(@request() req: Request, @response() res: Response) {
    return res.status(StatusCodes.OK).json({ message: 'Welcome Mofo' });
  }

  @httpPost('signup')
  async register(@request() req: Request, @response() res: Response) {
    try {
      const { email, password, birthdate } = signupSchema.parse(req.body);

      await this.userService.save({
        _id: email,
        password: password,
        birthdate,
      });

      res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: 'User successfully registered',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'failed',
          message: error.issues.map(issue => issue.message).join(', '),
        });
        return;
      }

      if (error instanceof MongoServerError) {
        if (error.code === 11000) {
          res.status(StatusCodes.CONFLICT).json({
            status: 'failed',
            message: 'A user with this email address already exists',
          });
        } else {
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: 'failed',
            message: error.errmsg,
          });
        }
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: 'An unexpected error occurred, try again later',
      });
    }
  }

  @httpPost('login')
  async login(@request() req: Request, @response() res: Response) {
    try {
      const { username, password } = loginSchema.parse(req.body);

      if (await this.userService.verify(username, password)) {
        const [accessToken, refreshToken] = await Promise.all([
          this.tokenService.issueJWT(username, { encrypted: true }),
          this.tokenService.issueRT(username),
        ]);

        res.status(StatusCodes.OK).json({
          status: 'success',
          message: {
            accessToken,
            refreshToken,
          },
        });
      } else {
        res.status(StatusCodes.UNAUTHORIZED).json({
          status: 'failed',
          message: 'Invalid username or password',
        });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'failed',
          message: error.issues.map(issue => issue.message).join(', '),
        });
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: error,
      });
    }
  }

  @httpPost('logout')
  async logout(@request() req: Request, @response() res: Response) {
    try {
      const { accessToken, refreshToken } = logoutSchema.parse(req.body);

      await Promise.all([
        this.tokenService.revokeJWT('logout', accessToken),
        this.tokenService.revokeRT(refreshToken),
      ]);

      res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'User successfully logged out',
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'failed',
          message: error.issues.map(issue => issue.message).join(', '),
        });
        return;
      }

      if (error instanceof MongoServerError) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 'failed',
          message: error.errmsg,
        });
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: error,
      });
    }
  }

  @httpPost('refresh-token')
  async refreshToken(@request() req: Request, @response() res: Response) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);

      const newAccessToken = await this.tokenService.refresh(refreshToken);

      res.status(StatusCodes.OK).json({
        status: 'success',
        message: {
          accessToken: newAccessToken,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(StatusCodes.BAD_REQUEST).json({
          status: 'failed',
          message: error.issues.map(issue => issue.message).join(', '),
        });
        return;
      }

      if (error instanceof MongoServerError) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          status: 'failed',
          message: error.errmsg,
        });
        return;
      }

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'failed',
        message: error,
      });
    }
  }
}
