import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("verification", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .primary();
    table.string("email_change_token");
    table.string("verification_token");
    table.string("email_change");
    table.timestamp("email_change_expires");
    table.timestamp("verification_expires");

    table.index(["email_change_token"], "idx_verification_email_change_token");
    table.index(["verification_token"], "idx_verification_verification_token");
    table.index(["email_change"], "idx_verification_email_change");
    table.index(
      ["verification_expires"],
      "idx_verification_verification_expires"
    );
    table.index(
      ["email_change_expires"],
      "idx_verification_email_change_expires"
    );
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("verification");
}
