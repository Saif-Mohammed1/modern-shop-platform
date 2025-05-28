import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("device_fingerprints", (table) => {
    table.renameColumn("is_bot", "is_bot");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("device_fingerprints", (table) => {
    table.renameColumn("is_bot", "is_bot");
  });
}
