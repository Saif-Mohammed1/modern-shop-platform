import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // PreviousPasswords table (for previousPasswords array)
  await knex.schema.createTable("previous_passwords", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //

    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table.string("password").notNullable();
    table.timestamps(true, true);
    table.index("user_id", "idx_previous_passwords_user_id");
    table.index("password", "idx_previous_passwords_password");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("previous_passwords");
}
