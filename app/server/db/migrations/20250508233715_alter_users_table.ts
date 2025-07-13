import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Alter users table to add new columns
  await knex.schema.alterTable("users", (table) => {
    table.boolean("email_verified").defaultTo(false);
    table.boolean("phone_verified").defaultTo(false);

    table.index("email_verified", "idx_users_email_verified");
    table.index("phone_verified", "idx_users_phone_verified");
  });
}

export async function down(knex: Knex): Promise<void> {
  // Rollback the changes made in the up function
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("email_verified");
    table.dropColumn("phone_verified");

    table.dropIndex("idx_users_email_verified");
    table.dropIndex("idx_users_phone_verified");
  });
}
