// address.repository.ts

import type { Knex } from "knex";

import type { IAddressDB } from "@/app/lib/types/address.db.types";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";

import { BaseRepository } from "./BaseRepository";

export class AddressRepository extends BaseRepository<IAddressDB> {
  constructor(knex: Knex) {
    super(knex, "addresses");
  }

  async deleteAddress(
    id: string,
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    const result = await this.query(trx)
      .where("user_id", user_id)
      .andWhere("_id", id)
      .delete();
    return result === 1;
  }

  async getUserAddress(
    user_id: string,
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IAddressDB>> {
    const queryConfig: QueryBuilderConfig<IAddressDB> = {
      allowedFilters: ["user_id", "created_at"],
      //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IAddressDB>,
      //   maxLimit: 100,
    };

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(options.query.entries()),
      user_id: user_id,
      // ...(options?.page && { page: options.page.toString() }),
      // ...(options?.limit && { limit: options.limit.toString() }),
      // ...(options?.sort && { sort: options.sort }),
    });

    const queryBuilder = new QueryBuilder<IAddressDB>(
      this.knex,
      this.tableName,
      searchParams,
      queryConfig
    );

    if (options?.populate) {
      queryBuilder.join({
        table: "users",

        type: "left",
        on: {
          left: "user_id",
          right: "_id",
        },
        select: ["name", "email"],
      });
    }

    return await queryBuilder.execute();
  }
}
