import { WhereClause, OrderBy } from '../types';

export interface Adapter<M extends Record<string, any>> {
  findUnique<K extends keyof M>(
    model: K,
    where: WhereClause<M[K]>
  ): Promise<M[K] | null>;

  findMany<K extends keyof M>(
    model: K,
    opts?: {
      where?: WhereClause<M[K]>;
      orderBy?: OrderBy<M[K]>;
      skip?: number;
      take?: number;
    }
  ): Promise<M[K][]>;

  create<K extends keyof M, CreateInput = M[K]>(
    model: K,
    data: CreateInput[]
  ): Promise<M[K][]>;

  update<K extends keyof M>(
    model: K,
    where: WhereClause<M[K]>,
    data: Partial<M[K]>
  ): Promise<M[K]>;

  delete<K extends keyof M>(
    model: K,
    where: WhereClause<M[K]>
  ): Promise<void>;
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