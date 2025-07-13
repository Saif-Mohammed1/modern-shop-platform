import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // AuditLog table (for auditLog array)
  await knex.schema.createTable("two_factor_auth_audit_log", (table) => {
    table.uuid("_id").primary(); //

    table
      .uuid("two_factor_auth_id")
      .references("user_id")
      .inTable("two_factor_auth")
      .onDelete("CASCADE")
      .notNullable();
    table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
    table.string("action").notNullable();

    table.index(
      "two_factor_auth_id",
      "idx_two_factor_auth_audit_log_two_factor_auth_id"
    );
    table.index("action", "idx_two_factor_auth_audit_log_action");
    table.index("timestamp", "idx_two_factor_auth_audit_log_timestamp");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("two_factor_auth_audit_log");
}
