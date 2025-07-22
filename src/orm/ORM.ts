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
  create: (data: T[]) => Promise<T[]>;
  update: (where: WhereClause<T>, data: Partial<T>) => Promise<T>;
  delete: (where: WhereClause<T>) => Promise<void>;
};

type ORMWithModels<M extends Record<string, any>> = ORM<M> & {
  [K in keyof M]: ModelHandler<M[K]>;
};

export class ORM<M extends Record<string, any>> {
  constructor(
    private adapter: Adapter<M>,
    private models: M
  ) {
    for (const modelKey of Object.keys(models) as Array<keyof M>) {
      (this as any)[modelKey] = this.createModelHandler(modelKey);
    }
  }
  // as we can't directly use dynamic keys as ts doesn't support "dynamic property injection" on classes with type inference
  static init<M extends Record<string, any>>(adapter: Adapter<M>, models: M): ORMWithModels<M> {
    return new ORM(adapter, models) as ORMWithModels<M>;
  }

  private createModelHandler<K extends keyof M>(model: K): ModelHandler<M[K]> {
    return {
      findUnique: (where) => this.adapter.findUnique(model, where),
      findMany: (opts) => this.adapter.findMany(model, opts),
      create: (data) => this.adapter.create(model, data),
      update: (where, data) => this.adapter.update(model, where, data),
      delete: (where) => this.adapter.delete(model, where),
    };
  }
}