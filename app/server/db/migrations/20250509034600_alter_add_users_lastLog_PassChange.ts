import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.timestamp("last_login").notNullable().defaultTo(knex.fn.now());
    table.timestamp("password_changed_at");

    table.index("last_login", "idx_users_last_login");
    table.index("password_changed_at", "idx_users_password_changed_at");
  });
}
export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("last_login");
    table.dropColumn("password_changed_at");

    table.dropIndex("last_login", "idx_users_last_login");
    table.dropIndex("password_changed_at", "idx_users_password_changed_at");
  });
}
