import type { Knex } from "knex";

import {
  Preferences,
  UserCurrency,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.db.types";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    // table.uuid("_id").primary().defaultTo(knex.raw("uuid_generate_v4()"));
    table.uuid("_id").primary(); //
    table.string("name", 50).notNullable();
    table.string("email").notNullable().unique();
    table.string("phone");
    table.string("password").notNullable();
    table
      .enu("role", [...Object.values(UserRole)])
      .notNullable()
      .defaultTo(UserRole.CUSTOMER);
    table
      .enu("status", [...Object.values(UserStatus)])
      .notNullable()
      .defaultTo(UserStatus.ACTIVE);
    table
      .enu("preferences_language", [...Object.values(Preferences)])
      .defaultTo(Preferences.Uk);
    table
      .enu("preferences_currency", [...Object.values(UserCurrency)])
      .defaultTo(UserCurrency.UAH);
    table.boolean("preferences_marketingOptIn").defaultTo(false);
    table.boolean("login_notification_sent").defaultTo(false);
    table.boolean("two_factor_enabled").defaultTo(false);

    table.timestamps(true, true);

    table.index(["two_factor_enabled"], "idx_users_two_factor_enabled");
    table.index(["email"], "idx_users_email");
    table.index(["role", "status"], "idx_users_role_status");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("users");
}
// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   password: string;
//   role: UserRole;
//   status: UserStatus;
//   preferences_language: Preferences;
//   preferences_currency: UserCurrency;
//   preferences_marketingOptIn: boolean;
//   login_notification_sent: boolean;
//   created_at: Date;
//   updated_at: Date;
//   deletedAt?: Date;
// }
