import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("addresses", (table) => {
    table.uuid("_id").primary();
    table.string("street").notNullable();
    table.string("city").notNullable();
    table.string("state").notNullable();
    table.string("postal_code").notNullable();
    table.string("phone").notNullable();
    table.string("country").notNullable();
    table
      .uuid("user_id")
      .notNullable()
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamps(true, true);
    table.index("user_id", "idx_address_user_id");
    table.index("country", "idx_address_country");
    table.index("city", "idx_address_city");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("addresses");
}
