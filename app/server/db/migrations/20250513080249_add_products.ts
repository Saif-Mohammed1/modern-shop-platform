import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable("products", (table) => {
      table.uuid("_id").primary();
      table.string("name").notNullable();
      table.string("category").notNullable();
      table.float("price").notNullable();
      table.float("discount").defaultTo(0);
      table.timestamp("discount_expire");
      table.uuid("user_id").notNullable();
      table.text("description").notNullable();
      table.integer("stock").defaultTo(0);
      table.float("ratings_average").defaultTo(0).checkBetween([0, 5]);
      table.integer("ratings_quantity").defaultTo(0);
      table.boolean("active").defaultTo(true);
      table.string("slug").unique().notNullable();
      table.integer("reserved").defaultTo(0);
      table.timestamp("last_reserved");
      table.integer("sold").defaultTo(0);
      table.string("sku").unique().notNullable();
      table.timestamps(true, true);

      // ✅ Named constraints
      table.check("price >= 0.01", [], "check_price_positive");
      table.check(
        "discount >= 0 AND discount < price",
        [],
        "check_discount_range"
      );
      table.check("stock >= 0", [], "check_stock_positive");
      table.check(
        "ratings_quantity >= 0",
        [],
        "check_ratings_quantity_positive"
      );
      table.check(
        "reserved >= 0 AND reserved <= stock",
        [],
        "check_reserved_range"
      );
      table.check("sold >= 0 AND sold <= stock", [], "check_sold_range");

      // ✅ Indexes
      table.index(["name"], "idx_products_name");
      table.index(["category"], "idx_products_category");
      table.index(["slug"], "idx_products_slug");
      table.index(["price"], "idx_products_price");
      table.index(["discount"], "idx_products_discount");
      table.index(
        ["name", "category", "price", "ratings_average"],
        "idx_products_name_category_price_ratings_average"
      );
    })

    .createTable("product_images", (table) => {
      table.uuid("_id").primary();
      table
        .uuid("product_id")
        .references("_id")
        .inTable("products")
        .notNullable()
        .onDelete("CASCADE");
      table.string("link").notNullable();
      table.string("public_id").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());

      table.index(["product_id"], "idx_product_images_product_id");
    })
    .createTable("product_shopping_info", (table) => {
      table
        .uuid("product_id")
        .references("_id")
        .inTable("products")
        .notNullable()
        .onDelete("CASCADE")
        .primary();
      table.float("weight").notNullable();
      table.integer("length").notNullable();
      table.integer("width").notNullable();
      table.integer("height").notNullable();

      // ✅ Named constraints
      table.check("weight >= 0", [], "check_weight_positive");
      table.check("length >= 0", [], "check_length_positive");
      table.check("width >= 0", [], "check_width_positive");
      table.check("height >= 0", [], "check_height_positive");

      table.index(["product_id"], "idx_product_shopping_info_product_id");
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists("product_shopping_info")
    .dropTableIfExists("product_images")
    .dropTableIfExists("products");
}
