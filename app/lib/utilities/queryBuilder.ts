/**
  // Example usage:
  const productQueryConfig: QueryConfig<Product> = {
    allowedFilters: ['name', 'price', 'category', 'rating'],
    allowedSorts: ['price', 'rating', 'createdAt'],
    defaultSort: '-createdAt',
    searchFields: ['name', 'description'],
    maxLimit: 50,
    filterMap: {
      category: 'categoryId'
    }
  };

  const builder = new QueryBuilder(ProductModel, searchParams, productQueryConfig);
  const result = await builder.execute();

*/

import type {
  Query,
  FilterQuery,
  Model,
  Document,
  // QueryOptions,
  SortOrder,
  PopulateOptions,
} from "mongoose";
import type {
  PaginationMeta,
  QueryBuilderConfig,
  QueryBuilderResult,
} from "../types/queryBuilder.types";
import logger from "../logger/logs";

export class QueryBuilder<T extends Document> {
  private populateOptions: PopulateOptions[] = [];
  private query: Query<T[], T>;
  private config: Required<QueryBuilderConfig<T>>;
  private baseQuery: Query<T[], T>;
  private originalParams: URLSearchParams;
  private projection: Record<string, number> = {};
  page: number = 1;
  limit: number = 15;
  filter: FilterQuery<T> = {};

  constructor(
    model: Model<T>,
    searchParams: URLSearchParams,
    config: QueryBuilderConfig<T>
  ) {
    this.originalParams = new URLSearchParams(searchParams);
    this.config = {
      maxLimit: 15,
      enableTextSearch: false,
      paramAliases: {},
      filterMap: {},
      searchFields: [],
      // allowedFilters: [], // Default empty array
      allowedSorts: [], // Default empty array
      defaultSort: "-createdAt",
      fixedFilters: {},
      excludeFields: [],
      ...config,
    };
    this.baseQuery = model.find();
    this.query = this.baseQuery.clone();
    this.sanitizeInput();
  }

  private sanitizeInput(): void {
    // Remove invalid parameters
    for (const key of this.originalParams.keys()) {
      if (!this.originalParams.get(key) || !this.isValidParam(key)) {
        this.originalParams.delete(key);
      }
    }
  }

  // private isValidParam(key: string): boolean {
  //   const baseKey = key.replace(/\[.*\]/, "");
  //   return (
  //     this.config.allowedFilters.includes(baseKey as keyof T) ||
  //     ["page", "limit", "sort", "search", "fields"].includes(key)
  //   );
  // }
  private isValidParam(key: string): boolean {
    if (["page", "limit", "sort", "search", "fields"].includes(key)) {
      return true;
    }
    const baseKey = key.replace(/\[.*\]/, "");
    const dbField = this.config.filterMap[baseKey] || baseKey;
    return this.config.allowedFilters.includes(dbField as keyof T);
  }
  populate(options: PopulateOptions[]): this {
    this.populateOptions = options;
    return this;
  }
  private parseValue(value: string): any {
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
    // if (Date.parse(value)) return new Date(value);

    // Handle date parsing explicitly
    if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
      // MM-DD-YYYY format
      const [month, day, year] = value.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    }

    // Fallback to default parsing for ISO dates
    if (Date.parse(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }
    if (value.includes(",")) return value.split(",").map(this.parseValue);
    return value;
  }

  // private buildOperatorFilter(field: string, value: any): Record<string, any> {
  //   const operatorMatch = field.match(/(\w+)\[(\w+)\]/);
  //   if (operatorMatch) {
  //     const [, baseField, operator] = operatorMatch;
  //     return { [`$${operator}`]: value };
  //   }
  //   return value;
  // }

  private buildFilter(): this {
    const filter: Record<string, any> = {};

    for (const [key, value] of this.originalParams) {
      const operatorMatch = key.match(/^(\w+)\[(\w+)\]$/);
      const [baseKey, operator] = operatorMatch
        ? [operatorMatch[1], operatorMatch[2]]
        : [key, null];
      // : [key, null];

      // const dbField = this.config.filterMap[key] || key;
      // const aliasKey = this.config.paramAliases[key] || key;
      const aliasKey = this.config.paramAliases[baseKey] || baseKey;
      const dbField = this.config.filterMap[aliasKey] || aliasKey;
      let parsedValue = this.parseValue(value);
      if (aliasKey === "search") {
        this.handleTextSearch(parsedValue);
        continue;
      }

      // we dont need to check if the field is allowed or not becuse sentize input already did that
      // if (this.config.allowedFilters.includes(dbField as keyof T)) {
      //   filter[dbField as string] = this.buildOperatorFilter(
      //     aliasKey,
      //     parsedValue
      //   );
      // }
      if (!this.config.allowedFilters.includes(dbField as keyof T)) {
        continue;
      }
      // Adjust dates based on operator
      if (parsedValue instanceof Date && operator) {
        parsedValue = this.adjustDateForOperator(parsedValue, operator);
      }
      if (operator) {
        if (
          !["eq", "ne", "gt", "gte", "lt", "lte", "in", "nin"].includes(
            operator
          )
        ) {
          logger.warn(`Invalid operator: ${operator}`);
          continue; // Skip invalid operators
        }
        // Merge operators for the same field
        if (filter[dbField as string]) {
          filter[dbField as string] = {
            ...filter[dbField as string],
            [`$${operator}`]: parsedValue,
          };
        } else {
          filter[dbField as string] = { [`$${operator}`]: parsedValue };
        }
      } else {
        filter[dbField as string] = parsedValue;
      }
    }

    this.filter = {
      ...this.filter,
      ...filter,
      ...(this.config.fixedFilters || {}),
    };
    // Apply fixed filters from config
    // if (this.config.fixedFilters) {
    //   this.filter = { ...this.filter, ...this.config.fixedFilters };
    // }
    // Apply exclude fields
    if (this.config.excludeFields?.length) {
      this.config.excludeFields.forEach((field) => {
        this.projection[field as string] = 0;
      });
    }
    this.query = this.query.find(this.filter).select(this.projection);

    return this;
  }

  private handleTextSearch(searchTerm: string): void {
    if (this.config.enableTextSearch) {
      this.filter.$text = { $search: searchTerm };
    } else if (this.config.searchFields?.length) {
      this.filter.$or = this.config.searchFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })) as FilterQuery<T>[];
    }
  }

  private buildSort(): this {
    const sortParam =
      this.originalParams.get("sort") || this.config.defaultSort;

    const sortFields = sortParam.split(",").reduce(
      (acc, field) => {
        let direction = 1; // Default ascending
        let rawField = field.trim();

        if (rawField.includes(":")) {
          // Handle case like price:desc
          const [key, order] = rawField.split(":");
          direction = order === "desc" ? -1 : 1;
          rawField = key;
        } else if (rawField.startsWith("-")) {
          // Handle case like -price
          direction = -1;
          rawField = rawField.substring(1);
        }

        // Map alias if exists
        const dbField = (this.config.filterMap[rawField] || rawField) as string;

        if (this.config.allowedSorts.includes(dbField as keyof T)) {
          acc[dbField] = direction as SortOrder;
        }

        return acc;
      },
      {} as Record<string, SortOrder>
    );

    if (Object.keys(sortFields).length) {
      this.query = this.query.sort(sortFields);
    }

    return this;
  }

  private buildPagination(): this {
    this.page = Math.max(1, parseInt(this.originalParams.get("page") || "1"));

    this.limit = Math.min(
      this.config.maxLimit,
      parseInt(this.originalParams.get("limit") || String(this.config.maxLimit))
    );
    return this;
  }

  private buildProjection(): this {
    if (this.originalParams.has("fields")) {
      const fields = this.originalParams
        .get("fields")!
        .split(",")
        .map((f) => this.config.filterMap[f] || f)
        .filter((f) => this.config.allowedFilters.includes(f as keyof T))
        .join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }

  private buildLinks(totalPages: number): Record<string, string> {
    const links: Record<string, string> = {};
    const params = new URLSearchParams(this.originalParams);

    if (params.has("userId")) {
      params.delete("userId");
    }
    if (this.page > 1) {
      params.set("page", "1");
      links.first = `?${params}`;
      params.set("page", String(this.page - 1));
      links.prev = `?${params}`;
    }

    if (this.page < totalPages) {
      params.set("page", String(this.page + 1));
      links.next = `?${params}`;
      params.set("page", String(totalPages));
      links.last = `?${params}`;
    }

    return links;
  }

  private adjustDateForOperator(date: Date, operator: string): Date {
    // Clone to avoid mutating original date
    const adjustedDate = new Date(date);
    switch (operator) {
      case "gte":
        adjustedDate.setUTCHours(0, 0, 0, 0); // Start of day
        break;
      case "lte":
        adjustedDate.setUTCHours(23, 59, 59, 999); // End of day
        break;
      case "gt":
        adjustedDate.setUTCHours(23, 59, 59, 999); // Treat as end of day
        break;
      case "lt":
        adjustedDate.setUTCHours(0, 0, 0, 0); // Treat as start of day
        break;
    }

    return adjustedDate;
  }
  async execute(): Promise<QueryBuilderResult<T>> {
    try {
      this.sanitizeInput();
      this.buildFilter().buildSort().buildPagination().buildProjection();

      // Clone the filtered query and clear pagination/sorting for count
      const countQuery = this.query.model.find(this.query.getFilter());

      // Apply population to MAIN QUERY
      if (this.populateOptions.length) {
        this.query = this.query.populate(this.populateOptions);
      }

      const [total, results] = await Promise.all([
        countQuery.countDocuments(),
        this.query
          .skip((this.page - 1) * this.limit)
          .limit(this.limit)
          .exec(),
      ]);

      const totalPages = Math.ceil(total / this.limit);
      const meta: PaginationMeta = {
        total,
        page: this.page,
        limit: this.limit,
        totalPages,
        hasNext: this.page < totalPages,
        hasPrev: this.page > 1,
      };

      return {
        docs: results,
        meta,
        links: this.buildLinks(totalPages),
      };
    } catch (error) {
      throw new QueryBuilderError("Failed to execute query", error);
    }
  }
}

class QueryBuilderError extends Error {
  constructor(
    public override message: string,
    public originalError: unknown,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = "QueryBuilderError";
    Error.captureStackTrace(this, QueryBuilderError);
  }
}
