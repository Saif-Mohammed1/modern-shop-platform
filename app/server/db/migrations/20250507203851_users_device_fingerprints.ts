import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // interface IDeviceFingerprintDB{
  //   _id: string;
  //   user_id: string;

  //   is_bot: boolean;
  //   source: "audit_log" | "login_history" | "user_sessions";
  //   ip: string;
  //   location_city: string;
  //   location_country: string;
  //   location_latitude: number;
  //   location_longitude: number;
  //   location_source: "ip" | "gps" | "user";
  //   fingerprint: string;
  // }
  await knex.schema.createTable("device_fingerprints", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //
    table
      .uuid("user_id")
      .references("_id")
      .inTable("users")
      .notNullable()
      .onDelete("CASCADE");
    table.string("os", 50).notNullable();
    table.string("browser", 50).notNullable();
    table.string("device", 50).notNullable();
    table.string("brand", 50).nullable();
    table.string("model", 50).nullable();
    table.boolean("is_bot").notNullable();
    table
      .enum("source", ["audit_log", "login_history", "user_sessions"])
      .notNullable();

    table.string("ip").notNullable();
    table.string("location_city", 100).notNullable();
    table.string("location_country", 100).notNullable();
    table.decimal("location_latitude", 10, 8).notNullable();
    table.decimal("location_longitude", 11, 8).notNullable();
    table.enu("location_source", ["ip", "gps", "user"]).notNullable();
    table.string("fingerprint", 255).notNullable();
    table.timestamps(true, true);

    // Optional: index for faster lookup
    table.index("fingerprint", "idx_device_fingerprints_fingerprint");
    table.index("ip", "idx_device_fingerprints_ip");
    table.index("location_city", "idx_device_fingerprints_location_city");
    table.index("location_country", "idx_device_fingerprints_location_country");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("device_fingerprints");
}
