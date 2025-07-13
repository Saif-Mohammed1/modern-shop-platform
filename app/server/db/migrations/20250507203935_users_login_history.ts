import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("login_history", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //

    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table
      .uuid("device_id")
      .references("_id")
      .inTable("device_fingerprints")
      .onDelete("CASCADE")
      .notNullable();

    table.index("user_id", "idx_login_history_user_id");
    table.index("device_id", "idx_login_history_device_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("login_history");
}
