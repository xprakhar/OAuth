import * as argon2 from 'argon2';
import { Collection, Document, InsertOneResult } from 'mongodb';
import { inject, injectable } from 'inversify';
import { MongoConnection } from '../utils/mongo-connection';
import { TYPES } from '../inversify-types';
import { IRepository } from './IRepository';
import { DB } from '../constants/DB';
import { logger } from '../utils/winston-logger';

interface UserDocument extends Document {
  _id: string;
  birthdate: Date;
  password: string;
}

export interface IUserService extends IRepository<UserDocument> {
  save(user: UserDocument): Promise<InsertOneResult<UserDocument>>;

  verify(userId: string, password: string): Promise<boolean>;
}

@injectable()
export class UserService implements IUserService {
  private usersCollection: Collection<UserDocument>;

  constructor(@inject(TYPES.MongoConnection) conn: MongoConnection) {
    this.usersCollection = conn.getCollection(DB.UsersCollection);
  }

  async verify(userId: string, password: string): Promise<boolean> {
    const user = await this.usersCollection.findOne({ _id: userId });
    if (!user) {
      logger.log(
        'error',
        `User verification failed: A user with email address (${userId}) does not exist`,
      );
      return false;
    }
    try {
      if (await argon2.verify(user.password, password)) {
        return true;
      } else {
        logger.log(
          'error',
          `User verification failed: Password does not match`,
        );

        return false;
      }
    } catch (error) {
      logger.log('error', (error as Error).message);

      return false;
    }
  }

  async save(user: UserDocument) {
    const { password } = user;

    const hash = await argon2.hash(password, {
      timeCost: 4,
      parallelism: 5,
      type: argon2.argon2id,
    });

    return this.usersCollection.insertOne({ ...user, password: hash });
  }

  async findById(id: string) {
    return this.usersCollection.findOne({ _id: id });
  }

  async updateById(id: string, doc: Partial<UserDocument>) {
    return this.usersCollection.updateOne(
      { _id: id },
      { $set: doc },
      { upsert: true },
    );
  }

  async deleteById(id: string) {
    return this.usersCollection.deleteOne({ _id: id });
  }
}
