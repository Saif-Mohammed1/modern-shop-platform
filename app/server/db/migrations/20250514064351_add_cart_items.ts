import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("cart_items", (table) => {
    table.uuid("_id").primary();
    table
      .uuid("user_id")
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
    table.integer("quantity").defaultTo(1).notNullable();
    table.timestamps(true, true);
    table.index("user_id", "idx_cart_user_id");
    table.index("product_id", "idx_cart_product_id");

    table.unique(["user_id", "product_id"], {
      indexName: "unique_cart_user_product",
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("cart_items");
}
