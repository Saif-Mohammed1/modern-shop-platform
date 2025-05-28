export interface QueryOptionConfig {
  query: URLSearchParams;
  // query?: Record<string, any>;
  // page?: number;
  // limit?: number;
  // sort?: string;
  populate?: boolean;
}
// types/queryBuilder.types.ts

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryBuilderResult<T> {
  docs: T[];
  meta: PaginationMeta;
  links?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}
/** Supported comparison operators */
export type Operator =
  | "eq" // =
  | "ne" // <>
  | "gt" // >
  | "gte" // >=
  | "lt" // <
  | "lte" // <=
  | "in" // IN
  | "nin" // NOT IN
  | "like" // LIKE
  | "ilike" // ILIKE
  | "contains" // @>
  | "overlap" // &&
  | "match"; // @@ (full-text search)

/** Extended type for JSONB operations */
export type JsonbOperator =
  | "hasKey" // ?
  | "hasAll" // ?&
  | "hasAny"; // ?|

export interface QueryBuilderConfig<T> {
  /** select column name */
  selectFields?: (keyof T)[];

  /** Fields to count by */
  totalCountBy?: (keyof T)[];

  /** exclude fields from links */
  excludeLinksFields?: string[];
  /** Fields to dateFormat */
  dateFormatFields?: Partial<Record<keyof T, string>>;
  /** Fields allowed for filtering (WHERE clauses) */
  allowedFilters: (keyof T)[];

  /** Fields allowed for sorting (ORDER BY) */
  allowedSorts?: (keyof T)[];

  /** Default sorting field and direction (e.g., '-created_at') */
  defaultSort?: string;

  /** Fields to use for full-text search */
  searchFields?: (keyof T)[];

  /** Maximum number of items per page */
  maxLimit?: number;

  /** Map query parameters to database columns */
  filterMap?: Record<string, keyof T>;

  /** Alternate parameter names */
  paramAliases?: Record<string, string>;

  /** Enable PostgreSQL full-text search */
  enableFullTextSearch?: boolean;

  /** Fixed filters to apply to all queries */
  fixedFilters?: Record<keyof T, any>;

  /** Fields to exclude from results */
  excludeFields?: (keyof T)[];

  /** Custom operators map (PostgreSQL specific) */
  operators?: Partial<Record<Operator, string>>;
}
