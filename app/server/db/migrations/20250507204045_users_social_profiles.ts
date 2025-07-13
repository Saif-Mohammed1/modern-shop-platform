import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // SocialProfiles table (for socialProfiles Map)
  await knex.schema.createTable("social_profiles", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //

    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table.string("provider", 50).notNullable();
    table.string("profile_id", 255).notNullable();
    table.timestamps(true, true);

    table.unique(["user_id", "provider"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("social_profiles");
}
