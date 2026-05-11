import type { HydratedDocument, Model, Types } from "mongoose";
import { BadRequestError, NotFoundError } from "../index"; 

export class DBService<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async getBy(filter: Record<string, any>): Promise<HydratedDocument<T>> {
    try {
      const data = await this.model.findOne(filter);
      if (!data) {
        throw new NotFoundError("Resource not found with the provided filter");
      }
      return data;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError(`GetBy Error: ${error.message}`);
    }
  }

  async getById(id: string | Types.ObjectId): Promise<HydratedDocument<T>> {
    try {
      const data = await this.model.findById(id);
      if (!data) {
        throw new NotFoundError(`Resource with ID ${id} not found`);
      }
      return data;
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new BadRequestError("Invalid ID format or Database Error");
    }
  }

  async getAll(filter: Record<string, any> = {}): Promise<HydratedDocument<T>[]> {
    try {
      return await this.model.find(filter);
    } catch (error: any) {
      throw new BadRequestError(`GetAll Error: ${error.message}`);
    }
  }

  async create(payload: Partial<T>): Promise<HydratedDocument<T>> {
    try {
      return await this.model.create(payload);
    } catch (error: any) {
      throw new BadRequestError(`Create Error: ${error.message}`);
    }
  }
}