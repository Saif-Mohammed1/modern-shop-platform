import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Check if the columns exist before dropping them
  const hasLastLogin = await knex.schema.hasColumn("security", "last_login");
  const hasPasswordChangedAt = await knex.schema.hasColumn(
    "security",
    "password_changed_at"
  );

  await knex.schema.alterTable("security", async (table) => {
    if (hasLastLogin) {
      // Check if the index exists before dropping it
      // mysql
      // const hasIndexLastLogin = await knex.raw(
      //   `SHOW INDEX FROM security WHERE Key_name = 'idx_security_lastLogin'`
      // );
      const hasIndexLastLogin = await knex
        .select("indexname")
        .from("pg_indexes")
        .where({
          tablename: "security",
          indexname: "idx_security_last_login",
        });
      if (hasIndexLastLogin.length > 0) {
        table.dropIndex("last_login", "idx_security_last_login");
      }
      table.dropColumn("last_login");
    }

    if (hasPasswordChangedAt) {
      // Check if the index exists before dropping it
      // const hasIndexPasswordChangedAt = await knex.raw(
      //   `SHOW INDEX FROM security WHERE Key_name = 'idx_security_passwordChangedAt'`
      // );
      const hasIndexPasswordChangedAt = await knex
        .select("indexname")
        .from("pg_indexes")
        .where({
          tablename: "security",
          indexname: "idx_security_password_changed_at",
        });
      if (hasIndexPasswordChangedAt.length > 0) {
        table.dropIndex(
          "password_changed_at",
          "idx_security_password_changed_at"
        );
      }
      table.dropColumn("password_changed_at");
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  // Recreate the columns and indexes in the down function
  await knex.schema.alterTable("security", (table) => {
    table.timestamp("last_login");
    table.timestamp("password_changed_at");
    table.index("last_login", "idx_security_last_login");
    table.index("password_changed_at", "idx_security_password_changed_at");
  });
}
