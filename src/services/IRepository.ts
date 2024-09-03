import {
  DeleteResult,
  Document,
  InsertOneResult,
  OptionalUnlessRequiredId,
  UpdateResult,
  WithId,
} from 'mongodb';

export interface IRepository<T extends Document = Document> {
  findById(id: T['_id']): Promise<WithId<T> | null>;

  save(doc: OptionalUnlessRequiredId<T>): Promise<InsertOneResult<T>>;

  updateById(id: T['_id'], doc: Partial<T>): Promise<UpdateResult<T>>;

  deleteById(id: T['id']): Promise<DeleteResult>;
}
