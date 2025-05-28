import type { Knex } from "knex";

import {
  AuditAction,
  AuditSource,
  EntityType,
} from "@/app/lib/types/audit.db.types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable("audit_logs", (table) => {
      table.uuid("_id").primary();
      table.uuid("actor").notNullable().references("_id").inTable("users");
      table.enu("action", [...Object.values(AuditAction)]).notNullable();
      table.enu("entity_type", [...Object.values(EntityType)]).notNullable();
      table.string("entity_id").notNullable();
      // table.string("ip_address");
      // table.string("user_agent");
      table.enu("source", [...Object.values(AuditSource)]).notNullable();
      table.string("correlation_id").notNullable();
      table.jsonb("context");
      table.timestamps(true, true);

      // ✅ Indexes
      table.index(["actor"], "idx_audit_logs_actor");
      table.index(["action"], "idx_audit_logs_action");
      table.index(
        ["entity_type", "entity_id"],
        "idx_audit_logs_entity_type_entity_id"
      );
      table.index(["actor", "entity_type"], "idx_audit_logs_actor_entity_type");
    })
    .createTable("audit_log_changes", (table) => {
      table.uuid("_id").primary();
      table
        .uuid("audit_log_id")
        .notNullable()
        .references("_id")
        .inTable("audit_logs")
        .onDelete("CASCADE");
      table.string("field").notNullable();
      table.jsonb("before").notNullable();
      table.jsonb("after").notNullable();
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.enu("change_type", ["ADD", "MODIFY", "REMOVE"]).notNullable();
      // ✅ Indexes
      table.index(["audit_log_id"], "idx_audit_log_changes_audit_log_id");
      table.index(
        ["field", "change_type"],
        "idx_audit_log_changes_field_change_type"
      );
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTableIfExists("audit_log_changes")
    .dropTableIfExists("audit_logs");
}
