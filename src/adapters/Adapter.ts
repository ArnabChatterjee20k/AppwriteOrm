import { WhereClause, OrderBy } from '../types';

export interface Adapter<M extends Record<string, any>> {
  findUnique<T = any>(
    collectionId: string,
    where: WhereClause<T>
  ): Promise<T | null>;

  findMany<T = any>(
    collectionId: string,
    opts?: {
      where?: WhereClause<T>;
      orderBy?: OrderBy<T>;
      skip?: number;
      take?: number;
    }
  ): Promise<T[]>;

  create<T = any, CreateInput = T>(
    collectionId: string,
    data: CreateInput[]
  ): Promise<T[]>;

  update<T = any>(
    collectionId: string,
    where: WhereClause<T>,
    data: Partial<T>
  ): Promise<T>;

  delete<T = any>(
    collectionId: string,
    where: WhereClause<T>
  ): Promise<void>;

  upsert<T = any, CreateInput = T>(
    collectionId: string,
    data: CreateInput
  ): Promise<T>;
}

type ModelsMap = {
  users: {
    id: string;
    name: string;
    email: string;
    age: number;
    isActive: boolean;
  };
  posts: {
    id: string;
    title: string;
    content: string;
  };
};