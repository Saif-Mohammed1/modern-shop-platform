import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("refunds", (table) => {
    table.uuid("_id").primary();
    table
      .uuid("user_id")
      .notNullable()
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .enu("status", ["pending", "approved", "rejected"])
      .defaultTo("pending");
    table.string("issue").notNullable();
    table.string("reason").notNullable();
    table.string("invoice_id").notNullable();
    table.decimal("amount", 10, 2).notNullable().checkPositive();
    table.timestamps(true, true);

    // Add indexes for better query performance
    table.index(["user_id"], "idx_refunds_user");
    table.index(["status"], "idx_refunds_status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("refunds");
}
