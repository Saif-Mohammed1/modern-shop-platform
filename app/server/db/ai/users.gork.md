import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
// Users table
await knex.schema.createTable("users", (table) => {
table.increments("id").primary();
table.string("name", 50).notNullable();
table.string("email", 255).notNullable().unique();
table.string("phone", 20).nullable();
table.string("password", 255).notNullable();
table
.enum("role", ["customer", "admin", "moderator"])
.defaultTo("customer");
table
.enum("status", ["active", "inactive", "suspended", "deleted"])
.defaultTo("active");
table
.enum("preferences_language", ["en", "es", "fr", "de", "uk"])
.defaultTo("uk");
table
.enum("preferences_currency", ["USD", "EUR", "GBP", "UAH"])
.defaultTo("UAH");
table.boolean("preferences_marketingOptIn").defaultTo(false);
table.boolean("login_notification_sent").defaultTo(false);
table.timestamp("created_at").defaultTo(knex.fn.now());
table.timestamp("updated_at").defaultTo(knex.fn.now());
table.index("email");
});

// AuthMethods table (for authMethods array)
await knex.schema.createTable("auth_methods", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table
.enum("auth_method", ["email", "google", "facebook", "apple"])
.notNullable();
});

// Security table (one-to-one with users)
await knex.schema.createTable("security", (table) => {
table
.uuid("user_id")
.primary()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.string("two_factor_secret", 255).nullable();
table.timestamp("two_factor_secret_expiry").nullable();
table.boolean("two_factor_enabled").defaultTo(false);
table.timestamp("last_login").nullable();
table.timestamp("password_changed_at").nullable();
table.boolean("suspicious_device_change").defaultTo(false);
table.boolean("impossible_travel").defaultTo(false);
table.integer("request_velocity").defaultTo(0);
});

// RateLimits table (for rateLimits object)
await knex.schema.createTable("rate_limits", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table
.enum("action", [
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
table.unique(["user_id", "action"]);
});

// AuditLog table (for auditLog array)
await knex.schema.createTable("audit_log", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
table
.enum("action", [
"LOGIN_ATTEMPT",
"PASSWORD_CHANGE",
"ACCOUNT_LOCKED",
"IMPOSSIBLE_TRAVEL",
"NEW_DEVICE_ALERT_SENT",
"BOT_DETECTED",
])
.notNullable();
table.boolean("details_success").notNullable();
table.string("details_message", 255).nullable();
table.string("device_os", 50).notNullable();
table.string("device_browser", 50).notNullable();
table.string("device_device", 50).notNullable();
table.string("device_brand", 50).nullable();
table.string("device_model", 50).nullable();
table.boolean("device_is_bot").notNullable();
table.string("device_ip", 45).notNullable();
table.string("device_location_city", 100).notNullable();
table.string("device_location_country", 100).notNullable();
table.decimal("device_location_latitude", 10, 8).notNullable();
table.decimal("device_location_longitude", 11, 8).notNullable();
table.string("device_location_source", 50).notNullable();
table.string("device_fingerprint", 255).notNullable();
table.timestamp("device_timestamp").notNullable().defaultTo(knex.fn.now());
table.boolean("device_success").notNullable();
table.index("timestamp");
});

// LoginHistory table (for loginHistory array)
await knex.schema.createTable("login_history", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.string("os", 50).notNullable();
table.string("browser", 50).notNullable();
table.string("device", 50).notNullable();
table.string("brand", 50).nullable();
table.string("model", 50).nullable();
table.boolean("is_bot").notNullable();
table.string("ip", 45).notNullable();
table.string("location_city", 100).notNullable();
table.string("location_country", 100).notNullable();
table.decimal("location_latitude", 10, 8).notNullable();
table.decimal("location_longitude", 11, 8).notNullable();
table.string("location_source", 50).notNullable();
table.string("fingerprint", 255).notNullable();
table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
table.boolean("success").notNullable();
table.index("ip");
table.index("fingerprint");
table.index("location_city");
table.index("location_country");
table.index("timestamp");
});

// PreviousPasswords table (for previousPasswords array)
await knex.schema.createTable("previous_passwords", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.string("password").notNullable();
});

// Verification table (one-to-one with users)
await knex.schema.createTable("verification", (table) => {
table
.uuid("user_id")
.primary()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.boolean("email_verified").defaultTo(false);
table.string("email_change_token", 255).nullable();
table.timestamp("email_change_expires").nullable();
table.string("email_change", 255).nullable();
table.boolean("phone_verified").defaultTo(false);
table.string("verification_token", 255).nullable();
table.timestamp("verification_expires").nullable();
table.index("email_verified");
});

// SocialProfiles table (for socialProfiles Map)
await knex.schema.createTable("social_profiles", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("id")
.inTable("users")
.onDelete("CASCADE");
table.string("provider", 50).notNullable();
table.string("profile_id", 255).notNullable();
table.unique(["user_id", "provider"]);
});
}

export async function down(knex: Knex): Promise<void> {
await knex.schema.dropTableIfExists("social_profiles");
await knex.schema.dropTableIfExists("verification");
await knex.schema.dropTableIfExists("previous_passwords");
await knex.schema.dropTableIfExists("login_history");
await knex.schema.dropTableIfExists("audit_log");
await knex.schema.dropTableIfExists("rate_limits");
await knex.schema.dropTableIfExists("security");
await knex.schema.dropTableIfExists("auth_methods");
await knex.schema.dropTableIfExists("users");
}
