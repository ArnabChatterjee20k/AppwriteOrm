type Primitive = string | number | boolean;

type BaseFilter<T> = {
  equals?: T;
  not?: T;
  in?: T[];
};

// specific type filters
type StringFilter = BaseFilter<string> & {
  contains?: string;
  startsWith?: string;
};

type NumberFilter = BaseFilter<number> & {
  lt?: number;
  lte?: number;
  gt?: number;
  gte?: number;
};

type BooleanFilter = BaseFilter<boolean>;

// for mapping provided filter to a Specific type filter
type FieldFilter<T> =
  T extends string ? StringFilter :
  T extends number ? NumberFilter :
  T extends boolean ? BooleanFilter :
  never;

// to support both nested filter and direct equals filter
export type WhereClause<T> = {
  [K in keyof T]?: T[K] | FieldFilter<T[K]>
};

export type OrderBy<T> = {
  [K in keyof T]?: 'asc' | 'desc';
};