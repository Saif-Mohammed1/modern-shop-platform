import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Alter login_history table to add new columns
  await knex.schema.alterTable("login_history", (table) => {
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.boolean("success").defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Rollback the changes made in the up function
  await knex.schema.alterTable("login_history", (table) => {
    table.dropColumn("created_at");
    table.dropColumn("success");
  });
}
