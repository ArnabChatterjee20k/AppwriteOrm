import { Client, Databases, Models, Query } from 'node-appwrite';
import { Adapter } from './Adapter';
import { WhereClause, OrderBy } from '../types';

export class AppwriteAdapter<M extends Record<string, any>> implements Adapter<M> {
  private db: Databases;

  constructor(
    client: Client,
    private databaseId: string
  ) {
    this.db = new Databases(client);
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

  async findUnique<T = any>(collectionId: string, where: WhereClause<T>): Promise<T | null> {
    const list = await this.findMany<T>(collectionId, { where, take: 1 });
    return list[0] ?? null;
  }

  async findMany<T = any>(
    collectionId: string,
    opts: {
      where?: WhereClause<T>;
      orderBy?: OrderBy<T>;
      skip?: number;
      take?: number;
    } = {}
  ): Promise<T[]> {
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
    return res.documents as T[];
  }

  async create<T = any, CreateInput = T>(collectionId: string, data: CreateInput[]): Promise<T[]> {
    return Promise.all(
      data.map((entry: any) =>
        this.db.createDocument(this.databaseId, collectionId, entry['$id'] ? entry['$id'] : 'unique()', entry)
      )
    ) as Promise<T[]>;
  }

  async update<T = any>(collectionId: string, where: WhereClause<T>, data: Partial<T>): Promise<T> {
    const existing = await this.findUnique<T>(collectionId, where);
    if (!existing) throw new Error('Document not found');
    return this.db.updateDocument(this.databaseId, collectionId, (existing as any).$id, data) as Promise<T>;
  }

  async delete<T = any>(collectionId: string, where: WhereClause<T>): Promise<void> {
    const existing = await this.findUnique<T>(collectionId, where);
    if (!existing) throw new Error('Document not found');
    await this.db.deleteDocument(this.databaseId, collectionId, (existing as any).$id);
  }

  async upsert<T = any, CreateInput = T>(collectionId: string, data: CreateInput): Promise<T> {
    return this.db.upsertDocument(this.databaseId, collectionId, (data as any)['$id']? (data as any)['$id'] :'unique()', data as any) as T
  }
}
