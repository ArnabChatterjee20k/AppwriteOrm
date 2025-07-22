import { Client, Databases, Query } from 'node-appwrite';
import { Adapter } from './Adapter';
import { WhereClause, OrderBy } from '../types';

export class AppwriteAdapter<M extends Record<string, any>> implements Adapter<M> {
  private db: Databases;
  private collections: Record<string, string>;

  constructor(
    client: Client,
    private databaseId: string,
    collections: Record<string, string>
  ) {
    this.db = new Databases(client);
    this.collections = collections;
  }

  private toAppwriteQueries<T>(where: WhereClause<T> = {}): string[] {
    const queries: string[] = [];
    for (const key in where) {
      const condition = where[key];
      if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        if ('equals' in condition) queries.push(Query.equal(key, [(condition as any).equals]));
        if ('in' in condition) queries.push(Query.equal(key, (condition as any).in));
        if ('lt' in condition) queries.push(Query.lessThan(key, (condition as any).lt));
        if ('lte' in condition) queries.push(Query.lessThanEqual(key, (condition as any).lte));
        if ('gt' in condition) queries.push(Query.greaterThan(key, (condition as any).gt));
        if ('gte' in condition) queries.push(Query.greaterThanEqual(key, (condition as any).gte));
        if ('not' in condition) queries.push(Query.notEqual(key, [(condition as any).not]));
        if ('contains' in condition) queries.push(Query.search(key, (condition as any).contains));
        if ('startsWith' in condition) queries.push(Query.startsWith(key, (condition as any).startsWith));
      } else if (condition !== undefined) {
        queries.push(Query.equal(key, [condition as any]));
      }
    }
    return queries;
  }

  async findUnique<K extends keyof M>(model: K, where: WhereClause<M[K]>): Promise<M[K] | null> {
    const list = await this.findMany(model, { where, take: 1 });
    return list[0] ?? null;
  }

  async findMany<K extends keyof M>(
    model: K,
    opts: {
      where?: WhereClause<M[K]>;
      orderBy?: OrderBy<M[K]>;
      skip?: number;
      take?: number;
    } = {}
  ): Promise<M[K][]> {
    const collectionId = this.collections[model as string];
    const queries = this.toAppwriteQueries(opts.where);

    if (opts.orderBy) {
      const [field, dir] = Object.entries(opts.orderBy)[0];
      queries.push(
        dir === 'asc' ? Query.orderAsc(field) : Query.orderDesc(field)
      );
    }

    if (opts.take) queries.push(Query.limit(opts.take));
    if (opts.skip) queries.push(Query.offset(opts.skip));

    const res = await this.db.listDocuments(this.databaseId, collectionId, queries);
    return res.documents as M[K][];
  }

  async create<K extends keyof M>(model: K, data: M[K][]): Promise<M[K][]> {
    const collectionId = this.collections[model as string];
    return Promise.all(
      data.map((entry) =>
        this.db.createDocument(this.databaseId, collectionId, 'unique()', entry as any)
      )
    ) as Promise<M[K][]>;
  }

  async update<K extends keyof M>(model: K, where: WhereClause<M[K]>, data: Partial<M[K]>): Promise<M[K]> {
    const existing = await this.findUnique(model, where);
    if (!existing) throw new Error('Document not found');
    const collectionId = this.collections[model as string];
    return this.db.updateDocument(this.databaseId, collectionId, (existing as any).$id, data) as Promise<M[K]>;
  }

  async delete<K extends keyof M>(model: K, where: WhereClause<M[K]>): Promise<void> {
    const existing = await this.findUnique(model, where);
    if (!existing) throw new Error('Document not found');
    const collectionId = this.collections[model as string];
    await this.db.deleteDocument(this.databaseId, collectionId, (existing as any).$id);
  }
}
