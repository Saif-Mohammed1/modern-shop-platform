import type { ClientSession, Document, FilterQuery, Model } from "mongoose";

// type id = Schema.Types.ObjectId;
export interface Repository<T> {
  find(filter?: FilterQuery<T>): Promise<T[]>;
  findById(id: string, session?: ClientSession | null): Promise<T | null>;
  create(data: Omit<T, "_id">, session?: ClientSession): Promise<T>;
  update(
    id: string,
    data: Partial<T>,
    session?: ClientSession
  ): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseRepository<T extends Document>
  implements Repository<T>
{
  constructor(protected model: Model<T>) {}

  async find(filter: FilterQuery<T> = {}): Promise<T[]> {
    return await this.model.find(filter);
  }

  async findById(
    id: string,
    session: ClientSession | null = null
  ): Promise<T | null> {
    return await this.model.findById(id).session(session);
  }

  async create(data: T | Omit<T, "_id">, session?: ClientSession): Promise<T> {
    const [docs] = await this.model.create([data], { session });
    return docs;
  }
  // async create(data: Omit<T, "id">): Promise<T> {
  //   return await this.model.create(data);
  // }

  async update(
    id: string,
    data: Partial<T>,
    session?: ClientSession
  ): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true, session });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }
}
