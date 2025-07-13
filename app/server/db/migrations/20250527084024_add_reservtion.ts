import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("reservations", (table) => {
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
    table.integer("quantity").notNullable().defaultTo(1);
    table
      .enu("status", ["pending", "confirmed", "cancelled"])
      .defaultTo("pending");
    table.timestamp("expires_at").notNullable();
    table.timestamps(true, true);

    // ✅ Named constraints
    table.check("quantity >= 1", [], "check_reservation_quantity_positive");

    //   indexes
    table.index("user_id", "idx_reservations_user_id");
    table.index("product_id", "idx_reservations_product_id");
    table.index(["status", "expires_at"], "idx_reservations_status_expires");
    table.index("expires_at", "idx_reservations_expires_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("reservations");
}
