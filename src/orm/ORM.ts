import { Adapter } from "../adapters/Adapter";
import { WhereClause, OrderBy } from "../types";

type ModelHandler<T> = {
  findUnique: (where: WhereClause<T>) => Promise<T | null>;
  findMany: (opts?: {
    where?: WhereClause<T>;
    orderBy?: OrderBy<T>;
    skip?: number;
    take?: number;
  }) => Promise<T[]>;
  create: <CreateInput = T>(data: CreateInput[]) => Promise<T[]>;
  update: (where: WhereClause<T>, data: Partial<T>) => Promise<T>;
  delete: (where: WhereClause<T>) => Promise<void>;
  upsert: <CreateInput = T>(data: CreateInput) => Promise<T>;
};

type ORMWithModels<M extends Record<string, any>> = ORM<M> & {
  [K in keyof M]: ModelHandler<M[K]>;
};

export class ORM<M extends Record<string, any>> {
  private collectionIds: Record<keyof M, string>;

  private constructor(
    private adapter: Adapter<M>,
    collectionIds: Record<keyof M, string>
  ) {
    this.collectionIds = collectionIds;
    for (const modelKey of Object.keys(collectionIds) as Array<keyof M>) {
      (this as any)[modelKey] = this.createModelHandler(modelKey);
    }
  }

  static init<M extends Record<string, any>>(adapter: Adapter<M>, collectionIds: Record<keyof M, string>): ORMWithModels<M> {
    return new ORM(adapter, collectionIds) as ORMWithModels<M>;
  }

  private createModelHandler<K extends keyof M>(model: K): ModelHandler<M[K]> {
    const collectionId = this.collectionIds[model];
    return {
      findUnique: (where) => this.adapter.findUnique(collectionId, where),
      findMany: (opts) => this.adapter.findMany(collectionId, opts),
      create: (data) => this.adapter.create(collectionId, data),
      update: (where, data) => this.adapter.update(collectionId, where, data),
      delete: (where) => this.adapter.delete(collectionId, where),
      upsert: (data) => this.adapter.upsert(collectionId, data),
    };
  }
}