import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("security", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .primary();
    table.string("two_factor_secret");
    table.timestamp("two_factor_secret_expiry");
    table.boolean("suspicious_device_change").defaultTo(false);
    table.boolean("impossible_travel").defaultTo(false);
    table.integer("request_velocity").defaultTo(0);
    table.timestamp("last_login");
    table.timestamp("password_changed_at");
    table.timestamps(true, true);

    table.index(["two_factor_secret"], "idx_security_two_factor_secret");
    table.index(
      ["two_factor_secret_expiry"],
      "idx_security_two_factor_secret_expiry"
    );
    table.index(
      ["suspicious_device_change"],
      "idx_security_suspicious_device_change"
    );
    table.index(["impossible_travel"], "idx_security_impossible_travel");
    table.index(["request_velocity"], "idx_security_request_velocity");

    table.index("last_login", "idx_security_last_login");
    table.index("password_changed_at", "idx_security_password_changed_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("security");
}
