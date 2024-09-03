import { Document, MongoClient, ServerApiVersion } from 'mongodb';
import { injectable } from 'inversify';

@injectable()
export class MongoConnection {
  private client: MongoClient;
  constructor() {
    const uri =
      `${process.env.DB_PROT}://${process.env.DB_HOST}:${process.env.DB_PORT}` ||
      '';

    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      compressors: ['zlib'],
    });
  }

  getCollection<T extends Document>(name: string) {
    return this.client.db(process.env.DB_NAME).collection<T>(name);
  }
}
