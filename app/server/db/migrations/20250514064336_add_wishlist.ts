import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("wishlist", (table) => {
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
    table.timestamps(true, true);
    table.index("user_id", "idx_wishlist_user_id");
    table.index("product_id", "idx_wishlist_product_id");
    table.unique(["user_id", "product_id"], {
      indexName: "unique_wishlist_user_product",
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("wishlist");
}
