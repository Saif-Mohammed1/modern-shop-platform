import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("two_factor_auth", (table) => {
    // table.string("_id", 64).primary(); // UUID as string
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable()
      .primary();
    table.string("encrypted_iv").notNullable();
    table.string("encrypted_salt").notNullable();
    table.string("encrypted_content").notNullable();
    table.string("encrypted_auth_tag").notNullable();
    table.string("backup_codes").notNullable();
    table.integer("recovery_attempts").defaultTo(0);
    table.timestamp("last_used").notNullable();

    table.timestamps(true, true); // created_at and updated_at
    table.index("user_id", "idx_two_factor_auth_user_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("two_factor_auth");
}
