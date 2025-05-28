import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reviews", (table) => {
    table.uuid("_id").primary(); // UUID
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable(); // UUID
    table
      .uuid("product_id")
      .references("_id")
      .inTable("products")
      .onDelete("CASCADE")
      .notNullable(); // UUID
    table.decimal("rating").notNullable();
    table.string("comment", 200).notNullable();

    table.timestamps(true, true);

    table.index(["user_id"], "idx_reviews_userId");
    table.index(["product_id"], "idx_reviews_productId");
    table.index(["rating"], "idx_reviews_rating");

    table.unique(["user_id", "product_id"], {
      indexName: "idx_reviews_userId_productId",
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reviews");
}
