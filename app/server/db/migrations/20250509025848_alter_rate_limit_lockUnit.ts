import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Alter rate_limit table to add new columns
  await knex.schema.alterTable("rate_limits", (table) => {
    table.timestamp("lock_until").alter();

    table.index("lock_until", "idx_rate_limit_lock_until");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Rollback the changes made in the up function
  await knex.schema.alterTable("rate_limits", (table) => {
    table.timestamp("lock_until").nullable().alter();
  });
}
