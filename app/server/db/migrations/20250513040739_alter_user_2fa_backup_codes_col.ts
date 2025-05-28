import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  const is_backup_codes_exist = await knex.schema.hasColumn(
    "two_factor_auth",
    "backup_codes"
  );
  const is_last_used_exist = await knex.schema.hasColumn(
    "two_factor_auth",
    "last_used"
  );
  await knex.schema.alterTable("two_factor_auth", (table) => {
    if (is_backup_codes_exist) {
      table.dropColumn("backup_codes");
    }
    if (!is_last_used_exist) {
      table.timestamp("last_used").notNullable().defaultTo(knex.fn.now());
    } else {
      table
        .timestamp("last_used")
        .notNullable()
        .defaultTo(knex.fn.now())
        .alter();
    }
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("two_factor_auth", (table) => {
    table.string("backup_codes").notNullable();
  });
}
