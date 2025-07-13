import type { Knex } from "knex";

import { SecurityAuditAction } from "@/app/lib/types/audit.db.types";

export async function up(knex: Knex): Promise<void> {
  // AuditLog table (for auditLog array)
  await knex.schema.createTable("audit_log", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //

    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
    table.enu("action", [...Object.values(SecurityAuditAction)]).notNullable();
    table.boolean("details_success").notNullable();
    table.string("details_message", 255).nullable();
    table
      .uuid("device_id")
      .references("_id")
      .inTable("device_fingerprints")
      .onDelete("CASCADE")
      .notNullable();

    table.index("device_id", "idx_audit_log_device_id");
    table.index("user_id", "idx_audit_log_user_id");
    table.index("action", "idx_audit_log_action");
    table.index("timestamp", "idx_audit_log_timestamp");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("audit_log");
}
