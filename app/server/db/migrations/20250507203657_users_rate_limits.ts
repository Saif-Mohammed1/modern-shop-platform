import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // RateLimits table (for rateLimits object)
  await knex.schema.createTable("rate_limits", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //

    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable();
    table
      .enu("action", [
        "login",
        "passwordReset",
        "verification",
        "2fa",
        "backup_recovery",
      ])
      .notNullable();
    table.integer("attempts").defaultTo(0);
    table.timestamp("last_attempt").nullable();
    table.timestamp("lock_until").nullable();
    table.timestamps(true, true);

    table.index("user_id", "idx_rate_limits_user_id");
    table.unique(["user_id", "action"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("rate_limits");
}
