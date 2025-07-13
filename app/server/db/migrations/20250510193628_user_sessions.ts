import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_sessions", (table) => {
    table.uuid("_id").primary(); // UUID
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .onDelete("CASCADE")
      .notNullable(); // UUID
    table
      .uuid("device_id")
      .references("_id")
      .inTable("device_fingerprints")
      .onDelete("CASCADE")
      .notNullable();
    table.string("hashed_token").notNullable();
    table.boolean("is_active").defaultTo(true);
    table.timestamp("revoked_at");
    table.timestamp("expires_at").notNullable();
    table.timestamp("last_used_at").defaultTo(knex.fn.now());
    table.timestamps(true, true);

    table.index(["user_id"], "idx_user_sessions_userId");
    table.index(
      ["user_id", "hashed_token", "is_active", "expires_at"],
      "idx_user_sessions_user_id_hashed_token_is_active_expires_at"
    );
    table.index(["device_id"], "idx_user_sessions_device_id");
    table.index(["hashed_token"], "idx_user_sessions_hashed_token");
    table.index(["expires_at"], "idx_user_sessions_expires_at");
    table.index(["last_used_at"], "idx_user_sessions_last_used_at");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("user_sessions");
}
