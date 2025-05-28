import type { Knex } from "knex";

import { OrderStatus } from "@/app/lib/types/orders.db.types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable("orders", (table) => {
      table.uuid("_id").primary();
      table.uuid("user_id").notNullable().references("_id").inTable("users");
      // .onDelete("CASCADE");
      table.string("invoice_id").notNullable();
      table.string("invoice_link").notNullable();
      table.string("currency").notNullable();
      table.float("subtotal").notNullable();
      table.float("tax").notNullable();
      table.float("total").notNullable();
      table.jsonb("order_notes");
      table.jsonb("cancellation_reason");
      table.jsonb("payment");
      table.enu("status", [...Object.values(OrderStatus)]);
      table.timestamps(true, true);
      table.index("user_id", "idx_orders_user_id");
    })
    .createTable("order_items", (table) => {
      table.uuid("_id").primary();
      table
        .uuid("order_id")
        .notNullable()
        .references("_id")
        .inTable("orders")
        .onDelete("CASCADE");
      table
        .uuid("product_id")
        .notNullable()
        .references("_id")
        .inTable("products");
      // .onDelete("CASCADE");
      table.string("name").notNullable();
      table.float("price").notNullable();
      table.float("discount").defaultTo(0).notNullable();
      table.integer("quantity").notNullable();
      table.string("sku").notNullable();
      table.decimal("shipping_info_weight").notNullable();
      table.jsonb("shipping_info_dimensions").notNullable();
      table.float("final_price").notNullable();
      // ✅ Named constraints
      //   - Check that the price is greater than or equal to 0.01
      //   - Check that the discount is greater than or equal to 0
      //   - Check that the quantity is greater than or equal to 1
      //   - Check that the final price is greater than or equal to 0.01
      table.check("price >= 0.01", [], "check_price_positive");
      table.check("discount >= 0", [], "check_discount_positive");
      table.check("quantity >= 1", [], "check_quantity_positive");
      table.check("final_price >= 0.01", [], "check_final_price_positive");

      //   indexes
      table.index("order_id", "idx_order_items_order_id");
      table.index("product_id", "idx_order_items_product_id");
      table.index("sku", "idx_order_items_sku");
    })
    .createTable("order_shipping_address", (table) => {
      table.uuid("_id").primary();
      table
        .uuid("order_id")
        .notNullable()
        .references("_id")
        .inTable("orders")
        .onDelete("CASCADE");
      table.string("street").notNullable();
      table.string("city").notNullable();
      table.string("state").notNullable();
      table.string("postal_code").notNullable();
      table.string("phone").notNullable();
      table.string("country").notNullable();

      // ✅ Named constraints

      //   indexes
      table.index("order_id", "idx_order_shipping_address_order_id");
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists("order_shipping_address")
    .dropTableIfExists("order_items")
    .dropTableIfExists("orders");
}
