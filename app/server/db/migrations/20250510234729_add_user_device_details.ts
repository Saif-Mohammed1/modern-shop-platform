import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("device_details", (table) => {
    table.string("fingerprint").primary(); // SHA256 hash as primary key
    table.string("os", 50).notNullable();
    table.string("browser", 50).notNullable();
    table.string("device", 50).notNullable();
    table.string("brand", 50).nullable();
    table.string("model", 50).nullable();
    table.timestamps(true, true);

    // Composite index for common lookups
    table.index(["os", "browser", "device"], "idx_device_details_composite");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("device_details");
}
