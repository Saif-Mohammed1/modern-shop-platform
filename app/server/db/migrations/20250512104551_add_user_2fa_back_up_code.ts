import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Backup Codes table
  await knex.schema.createTable("backup_codes", (table) => {
    table.uuid("_id").primary(); // UUID as uuid
    table
      .uuid("two_factor_auth_id")
      .references("user_id")
      .inTable("two_factor_auth")
      .onDelete("CASCADE")
      .notNullable();
    table.string("code").notNullable();
    table.boolean("is_used").defaultTo(false).notNullable();
    table.timestamps(true, true); // created_at and updated_at

    table.index("two_factor_auth_id", "idx_backup_codes_two_factor_auth_id");
    table.index(["code", "is_used"], "idx_backup_codes_code_used");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("backup_codes");
}
