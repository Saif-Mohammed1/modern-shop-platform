import type { Knex } from "knex";

import logger from "../logger/logs";
import type {
  PaginationMeta,
  QueryBuilderConfig,
  QueryBuilderResult,
} from "../types/queryBuilder.types";

interface JoinConfig {
  table: string;
  alias?: string; // Optional alias for table (e.g., 'pi' for product_images)
  type: "inner" | "left" | "right" | "full"; // Join type
  on: {
    left: string; // Column in primary table (e.g., products._id)
    right: string; // Column in joined table (e.g., product_images.product_id)
  };
  select: string[]; // Made select required with default empty array}
  outerKey?: string; // Optional outer key for the join
}
/***example of uses
 * .join({
        table: "product_images",
        alias: "pi",
        type: "left",
        on: { left: "_id", right: "product_id" },
        select: ["_id", "link", "public_id", "created_at"],
      })
      .join({
        table: "product_shopping_info",
        alias: "psi",
        type: "left",
        on: { left: "_id", right: "product_id" },
        select: ["weight", "length", "width", "height"],
      });
 */
export class QueryBuilder<T extends Record<string, any>> {
  private knex: Knex;
  private query: Knex.QueryBuilder;
  private config: Required<QueryBuilderConfig<T>>;
  private originalParams: URLSearchParams;
  private tableName: string;
  private totalCount?: number;
  private joins: JoinConfig[] = []; // Store join configurations
  private isAggregateEnabled: boolean = false;
  page: number = 1;
  limit: number = 15;
  filter: Record<string, any> = {};

  constructor(
    knex: Knex,
    tableName: string,
    searchParams: URLSearchParams,
    config: QueryBuilderConfig<T>,
    isAggregateEnabled: boolean = false
  ) {
    this.tableName = tableName;
    this.isAggregateEnabled = isAggregateEnabled;
    this.originalParams = new URLSearchParams(searchParams);
    this.config = {
      maxLimit: 15,
      enableFullTextSearch: false,
      paramAliases: {},
      filterMap: {},
      searchFields: [],
      allowedSorts: [],
      defaultSort: "-created_at",
      fixedFilters: {} as Record<keyof T, any>,
      excludeFields: [],
      selectFields: [],
      totalCountBy: [],
      excludeLinksFields: [],
      operators: {},
      dateFormatFields: {},
      ...config,
    };
    this.knex = knex;
    this.query = knex(this.tableName);
    this.sanitizeInput();
  }

  // Add a join to the query
  join(
    config: Omit<JoinConfig, "select"> & {
      select?: string[];
    }
  ): this {
    this.joins.push({
      ...config,
      alias: config.alias || config.table, // Default alias to table name
      select: config.select || [], // Default to empty array
    });
    return this;
  }

  private sanitizeInput(): void {
    for (const key of this.originalParams.keys()) {
      if (!this.originalParams.get(key) || !this.isValidParam(key)) {
        this.originalParams.delete(key);
      }
    }
  }

  private isValidParam(key: string): boolean {
    if (["page", "limit", "sort", "search", "fields"].includes(key)) {
      return true;
    }
    const baseKey = key.replace(/\[.*\]/, "");
    const dbField = this.config.filterMap[baseKey] || baseKey;
    const sanitizeField =
      typeof dbField === "string" && dbField.includes(".")
        ? dbField.split(".")[0] === String(this.tableName)
          ? dbField.split(".")[1]
          : dbField
        : dbField;
    return this.config.allowedFilters.includes(sanitizeField as keyof T);
  }

  private parseValue(value: string): any {
    if (value.includes(",")) {
      return value.split(",").map((v) => String(this.parseValue(v)));
    }
    if (/^\d+$/.test(value)) {
      return parseInt(value, 10);
    }
    if (/^\d+\.\d+$/.test(value)) {
      return parseFloat(value);
    }
    if (value.toLowerCase() === "true") {
      return true;
    }
    if (value.toLowerCase() === "false") {
      return false;
    }
    return value;
  }

  private buildFilter(): this {
    const whereClauses: Record<string, any> = {};

    for (const [key, value] of this.originalParams) {
      const operatorMatch = key.match(/(\w+)\[(\w+)\]/);
      const [baseKey, operator] = operatorMatch
        ? [operatorMatch[1], operatorMatch[2]]
        : [key, null];

      const aliasKey = this.config.paramAliases[baseKey] || baseKey;
      const dbField = this.config.filterMap[aliasKey] || aliasKey;
      const sanitizeField =
        typeof dbField === "string" && dbField.includes(".")
          ? dbField.split(".")[0] === String(this.tableName)
            ? dbField.split(".")[1]
            : dbField
          : dbField;
      if (aliasKey === "search") {
        this.handleTextSearch(value);
        continue;
      }

      if (!this.config.allowedFilters.includes(sanitizeField as keyof T)) {
        continue;
      }

      const parsedValue = this.parseValue(value);

      if (operator) {
        const column = this.buildColumnRef(dbField as keyof T);
        switch (operator) {
          case "gt":
            this.query.where(column, ">", parsedValue);
            break;
          case "gte":
            this.query.where(column, ">=", parsedValue);
            break;
          case "lt":
            this.query.where(column, "<", parsedValue);
            break;
          case "lte":
            this.query.where(column, "<=", parsedValue);
            break;
          case "ne":
            this.query.where(column, "<>", parsedValue);
            break;
          case "in":
            if (!Array.isArray(parsedValue)) {
              logger.warn("IN operator requires array value");
              break;
            }
            this.query.whereRaw("?? IN (?)", [column, parsedValue]);
            break;
          case "nin":
            if (!Array.isArray(parsedValue)) {
              logger.warn("NOT IN operator requires array value");
              break;
            }
            this.query.whereRaw("?? NOT IN (?)", [column, parsedValue]);
            break;
          default:
            logger.warn(`Unsupported operator: ${operator}`);
        }
      } else {
        whereClauses[dbField as string] = parsedValue;
      }
    }

    this.query.where({ ...whereClauses, ...this.config.fixedFilters });
    return this;
  }

  private buildColumnRef(field: keyof T): Knex.Raw {
    return this.knex.raw("??", [field as string]);
  }

  private handleTextSearch(searchTerm: string): void {
    if (
      !this.config.enableFullTextSearch ||
      !this.config.searchFields?.length
    ) {
      return;
    }

    const searchFields = this.config.searchFields
      .map((f) => `to_tsvector('english', ${String(f)})`)
      .join(" || ");

    this.query.whereRaw(`${searchFields} @@ to_tsquery('english', ?)`, [
      searchTerm.split(/\s+/).join(" & "),
    ]);
  }

  private buildSort(): this {
    const sortParam =
      this.originalParams.get("sort") || this.config.defaultSort;
    const sorts = sortParam.split(",").map((s) => s.trim());

    sorts.forEach((sort) => {
      let [field, direction] = sort.startsWith("-")
        ? [sort.slice(1), "desc"]
        : [sort, "asc"];

      if (field.includes(":")) {
        [field, direction] = field.split(":");
      }

      const dbField = this.config.filterMap[field] || field;
      if (this.config.allowedSorts.includes(dbField as keyof T)) {
        const orderByField = `${this.tableName}.${dbField as string}`;
        this.query.orderBy(orderByField, direction as "asc" | "desc");
      }
    });

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
    let selectFields: (string | Knex.Raw)[] = [];
    // let selectFields: string[] = this.config.selectFields?.length
    //   ? this.config.selectFields.map((f) => `${this.tableName}.${String(f)}`)
    //   : [`${this.tableName}.*`]; // Always select all from primary table
    if (this.config.selectFields?.length) {
      selectFields = this.config.selectFields.map((f) => {
        const field = String(f);

        // Add date formatting for specified fields
        if (this.config.dateFormatFields?.[field]) {
          const format = this.config.dateFormatFields[field];
          return this.knex.raw(
            `TO_CHAR(??, ?) as ??`,
            // `TO_CHAR(${this.tableName}.${field}, ?) as ${field}`,
            [
              `${this.tableName}.${field}`, // Use the field name directly
              format,
              field,
            ]
          );
        }
        return `${this.tableName}.${field}`;
      });
    }
    if (this.originalParams.has("fields")) {
      const fields = this.originalParams
        .get("fields")!
        .split(",")
        .map((f) => this.config.filterMap[f] || f)
        .filter((f) => this.config.allowedFilters.includes(f as keyof T));

      // Only include fields from the main table that are requested
      selectFields = fields.map((f) => `${this.tableName}.${String(f)}`);
    }

    if (this.joins.length) {
      // Add fields from joined tables
      selectFields.push(
        ...this.joins.flatMap((join) =>
          join.select.map((field) => `${join.alias}.${field}`)
        )
      );
    }
    if (!selectFields.length) {
      selectFields = [`${this.tableName}.*`];
    }

    this.query.select(selectFields);
    return this;
  }
  // private buildProjectionModeifyDate(): this {
  //   let selectFields: (string | Knex.Raw)[] = [];

  //   // Base select fields from config
  //   if (
  //     this.config.selectFields?.length &&
  //     !this.originalParams.has("fields")
  //   ) {
  //     selectFields = this.config.selectFields.map((f) => {
  //       const field = String(f);
  //       if (this.config.dateFormatFields?.[field]) {
  //         const format = this.config.dateFormatFields[field];
  //         return this.knex.raw(
  //           `TO_CHAR(${this.tableName}.${field}, ?) as ${field}`,
  //           [format]
  //         );
  //       }
  //       return `${this.tableName}.${field}`;
  //     });
  //   }

  //   // Override with fields parameter, preserving date formatting
  //   if (this.originalParams.has("fields")) {
  //     const fields = this.originalParams
  //       .get("fields")!
  //       .split(",")
  //       .map((f) => this.config.filterMap[f] || f)
  //       .filter((f) => this.config.allowedFilters.includes(f as keyof T));
  //     selectFields = fields.map((f) => {
  //       const field = String(f);
  //       if (this.config.dateFormatFields?.[field]) {
  //         const format = this.config.dateFormatFields[field];
  //         return this.knex.raw(
  //           `TO_CHAR(${this.tableName}.${field}, ?) as ${field}`,
  //           [format]
  //         );
  //       }
  //       return `${this.tableName}.${field}`;
  //     });
  //   }

  //   // Handle joins without overriding main fields
  //   if (this.joins.length) {
  //     const joinFields = this.joins.flatMap((join) =>
  //       join.select.map((field) => `${join.alias}.${field}`)
  //     );
  //     selectFields.push(...joinFields);
  //   }

  //   // If no specific fields are defined, select all from the main table
  //   if (!selectFields.length) {
  //     selectFields = [`${this.tableName}.*`];
  //   }

  //   this.query.select(selectFields);
  //   return this;
  // }
  private applyJoins(): this {
    this.joins.forEach((join) => {
      const joinType = join.type || "left";
      const leftColumn = join.on.left.includes(".")
        ? join.on.left
        : `${this.tableName}.${join.on.left}`;
      switch (joinType) {
        case "inner":
          this.query.innerJoin(
            `${join.table} as ${join.alias}`,
            `${leftColumn}`,
            `${join.alias}.${join.on.right}`
          );
          break;
        case "left":
          this.query.leftJoin(
            `${join.table} as ${join.alias}`,
            `${leftColumn}`,
            `${join.alias}.${join.on.right}`
          );
          break;
        case "right":
          this.query.rightJoin(
            `${join.table} as ${join.alias}`,
            `${leftColumn}`,
            `${join.alias}.${join.on.right}`
          );
          break;
        case "full":
          this.query.fullOuterJoin(
            `${join.table} as ${join.alias}`,
            `${leftColumn}`,
            `${join.alias}.${join.on.right}`
          );
          break;
        default:
          logger.warn(`Unsupported join type: ${joinType}`);
      }
    });
    return this;
  }
  private async getTotalCount(): Promise<number> {
    if (!this.config.totalCountBy.length && this.totalCount === undefined) {
      const countQuery = this.query
        .clone()
        .clearOrder()
        .clearSelect()
        .clear("group") // 💡 Add this to remove groupBy clauses
        .countDistinct(`${this.tableName}._id as total`); // Use distinct to avoid counting duplicates from joins
      // Add this before executing countQuery
      const [result] = (await countQuery) as { total: number }[];
      this.totalCount = Number(result?.total || 0);
    } else if (
      this.config.totalCountBy.length &&
      this.totalCount === undefined
    ) {
      const countByFields = this.config.totalCountBy.map(
        (field) => `${this.tableName}.${String(field)}`
      );
      const user_id = this.originalParams.get(`${this.tableName}.user_id`);

      const countQuery = this.query
        .clone()
        .clearOrder()
        .clearSelect()
        .clear("group")
        .where(`${this.tableName}.user_id`, user_id) // 💡 Add this to remove groupBy clauses
        // .groupBy(countByFields)
        .count(countByFields);
      // Add this before executing countQuery

      const [result] = (await countQuery) as { count: number }[];
      this.totalCount = Number(result?.count || 0);
    }
    return this.totalCount ?? 0;
  }
  aggregate(queries: string[], groupsBy: string[]): this {
    const q = queries.map((query) => this.knex.raw(query));
    // console.log("q", q);
    this.query.select(q).groupBy(groupsBy);
    return this;
  }
  async execute(): Promise<QueryBuilderResult<T>> {
    try {
      // Apply joins before other operations
      this.applyJoins()
        .buildFilter()
        .buildSort()
        .buildPagination()
        .buildProjection();

      // Group by primary table's _id to handle one-to-many joins
      if (!this.isAggregateEnabled && this.joins.length) {
        // Aggregate joined data (e.g., images)
        const defaultSelectFields = this.config.selectFields?.length
          ? this.config.selectFields.map(
              (f) => `${this.tableName}.${String(f)}`
            )
          : [`${this.tableName}.*`]; // Always select all from primary table
        const selectFields = [
          ...defaultSelectFields,
          ...this.joins.map((join) =>
            this.knex.raw(
              `json_agg(json_build_object(${join.select
                .map((f) => `'${f}', ${join.alias}.${f}`)
                .join(", ")})) as ${join.outerKey ?? `${join.alias}_data`}`
            )
          ),
        ];
        // const groupByFields = [
        //   `${this.tableName}._id`,
        //   ...this.joins.flatMap((join) =>
        //     join.select.map((f) => `${join.alias}.${f}`)
        //   ),
        // ];
        // console.log("selectFields", selectFields);
        this.query
          .clearSelect()
          .select(selectFields)
          .groupBy(`${this.tableName}._id`);
        // this.query.groupBy(groupByFields);
      }

      const [data, total] = await Promise.all([
        this.query.offset((this.page - 1) * this.limit).limit(this.limit),
        this.getTotalCount(),
      ]);

      // Transform results to match T (e.g., IProductDB)
      // const transformedData = data.map((row: any) => {
      //   const result = { ...row } as T;
      //   this.joins.forEach((join) => {
      //     const key =
      //       join.alias === "product_images" ? "images" : `${join.alias}_data`;
      //     result[key as keyof T] = row[`${join.alias}_data`] || [];
      //   });
      //   return result;
      // });

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
        docs: data,
        meta,
        links: this.buildLinks(totalPages),
      };
    } catch (error) {
      logger.error("QueryBuilder Error:", error);
      throw new QueryBuilderError("Failed to execute query", error);
    }
  }

  private buildLinks(totalPages: number): Record<string, string> {
    const links: Record<string, string> = {};
    const params = new URLSearchParams(this.originalParams);
    for (const key of params.keys()) {
      if (this.config.excludeLinksFields?.includes(key)) {
        params.delete(key);
      }
    }
    ["first", "prev", "next", "last"].forEach((rel) => {
      const pageMap = {
        first: 1,
        prev: this.page - 1,
        next: this.page + 1,
        last: totalPages,
      };

      if (
        (rel === "prev" && this.page > 1) ||
        (rel === "next" && this.page < totalPages) ||
        rel === "first" ||
        rel === "last"
      ) {
        params.set("page", String(pageMap[rel as keyof typeof pageMap]));
        links[rel] = `?${params}`;
      }
    });

    return links;
  }
}

class QueryBuilderError extends Error {
  constructor(
    public override message: string,
    public originalError: unknown
  ) {
    super(message);
    this.name = "QueryBuilderError";
    Error.captureStackTrace(this, QueryBuilderError);
  }
}
