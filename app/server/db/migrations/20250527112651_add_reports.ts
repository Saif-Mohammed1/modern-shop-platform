import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reports", (table) => {
    table.uuid("_id").primary();
    table
      .uuid("reporter_id")
      .notNullable()
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .uuid("product_id")
      .notNullable()
      .references("_id")
      .inTable("products")
      .onDelete("CASCADE");
    table
      .enu("status", ["pending", "resolved", "rejected"])
      .defaultTo("pending");
    table.string("name").notNullable();
    table.string("issue").notNullable();
    table.text("message").notNullable();
    table.timestamp("resolved_at");
    table.timestamps(true, true);
    // Add indexes for better query performance
    table.index(["reporter_id", "product_id"], "idx_reports_user_product");
    table.index("status", "idx_reports_status");
    // table.index('')
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reports");
}
