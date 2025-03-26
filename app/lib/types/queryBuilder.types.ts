import type { FilterQuery } from "mongoose";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface QueryBuilderResult<T> {
  readonly docs: T[];
  meta: PaginationMeta;
  links?: {
    first?: string;
    prev?: string;
    next?: string;
    last?: string;
  };
}
export interface QueryBuilderConfig<T> {
  allowedFilters: (keyof T)[];
  allowedSorts?: (keyof T)[];
  defaultSort?: string;
  searchFields?: (keyof T)[];
  maxLimit?: number;
  filterMap?: Record<string, keyof T>;
  paramAliases?: Record<string, string>;
  enableTextSearch?: boolean;
  fixedFilters?: FilterQuery<T>; // Add this line
}

export type Operator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "ne"
  | "in"
  | "nin"
  | "regex";
export interface QueryOptionConfig {
  query: URLSearchParams;
  // query?: Record<string, any>;
  // page?: number;
  // limit?: number;
  // sort?: string;
  populate?: boolean;
}
