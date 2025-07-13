import type { Knex } from "knex";

import type {
SecurityAuditAction,
AuditLogDetails,
} from "@/app/lib/types/audit.db.types";
import {
UserCurrency,
UserRole,
UserStatus,
AuthMethod,
Preferences as Language,
} from "@/app/lib/types/users.db.types";

// TypeScript interfaces for type safety
interface User {
\_id: number;
name: string;
email: string;
phone?: string;
password: string;
role: UserRole;
status: UserStatus;
preferences_language: Language;
preferences_currency: UserCurrency;
preferences_marketingOptIn: boolean;
login_notification_sent: boolean;
created_at: Date;
updated_at: Date;
deletedAt?: Date;
}

interface AuthMethodRecord {
id: number;
user_id: number;
auth_method: AuthMethod;
}

interface Verification {
user_id: number;
email_verified: boolean;
phone_verified: boolean;
email_change_token?: string;
email_change?: string;
verification_token?: string;
email_change_expires?: Date;
verification_expires?: Date;
}

interface Security {
user_id: number;
two_factor_secret?: string;
two_factor_secret_expiry?: Date;
two_factor_enabled: boolean;
suspicious_device_change: boolean;
impossible_travel: boolean;
request_velocity: number;
last_login?: Date;
password_changed_at?: Date;
}

interface RateLimit {
id: number;
user_id: number;
action:
| "login"
| "passwordReset"
| "verification"
| "2fa"
| "backup_recovery";
attempts: number;
last_attempt?: Date;
lock_until?: Date;
}

interface DeviceInfo {
id: number;
os: string;
browser: string;
device: string;
brand?: string;
model?: string;
is_bot: boolean;
ip: string;
location_city: string;
location_country: string;
location_latitude: number;
location_longitude: number;
location_source: string;
fingerprint: string;
timestamp: Date;
success: boolean;
}

interface AuditLog {
id: number;
user_id: number;
timestamp: Date;
action: SecurityAuditAction;
details_success: boolean;
details_message: string; //for storing audit_log details_message?
device_id?: number; // References DeviceInfo
}

interface PreviousPassword {
id: number;
user_id: number;
password: string;
}

interface SocialProfile {
id: number;
user_id: number;
provider: string;
profile_id: string;
}

export async function up(knex: Knex): Promise<void> {
// Users table
await knex.schema.createTable("users", (table) => {
table.increments("_id").primary();
table.string("name", 50).notNullable();
table.string("email", 255).notNullable().unique();
table.string("phone", 20).nullable();
table.string("password", 255).notNullable();
table
.enum("role", Object.values(UserRole))
.notNullable()
.defaultTo(UserRole.CUSTOMER);
table
.enum("status", Object.values(UserStatus))
.notNullable()
.defaultTo(UserStatus.ACTIVE);
table
.enum("preferences_language", Object.values(Language))
.notNullable()
.defaultTo(Language.Uk);
table
.enum("preferences_currency", Object.values(UserCurrency))
.notNullable()
.defaultTo(UserCurrency.UAH);
table.boolean("preferences_marketingOptIn").notNullable().defaultTo(false);
table.boolean("login_notification_sent").notNullable().defaultTo(false);
table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
table.timestamp("deletedAt").nullable(); // Soft delete
table.check(
'email REGEXP "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"',
[],
"chk_email_format"
);
table.index("email", "idx_users_email");
});

// AuthMethods table
await knex.schema.createTable("auth_methods", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.enum("auth_method", Object.values(AuthMethod)).notNullable();
table.timestamps(true, true);
table.unique(["user_id", "auth_method"], "uniq_auth_methods_user_method");
});

// Verification table
await knex.schema.createTable("verification", (table) => {
table
.uuid("user_id")
.primary()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.boolean("email_verified").notNullable().defaultTo(false);
table.boolean("phone_verified").notNullable().defaultTo(false);
table.string("email_change_token", 255).nullable();
table.string("email_change", 255).nullable();
table.string("verification_token", 255).nullable();
table.timestamp("email_change_expires").nullable();
table.timestamp("verification_expires").nullable();
table.index("email_verified", "idx_verification_emailVerified");
});

// Security table
await knex.schema.createTable("security", (table) => {
table
.uuid("user_id")
.primary()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.string("two_factor_secret", 255).nullable();
table.timestamp("two_factor_secret_expiry").nullable();
table.boolean("two_factor_enabled").notNullable().defaultTo(false);
table.boolean("suspicious_device_change").notNullable().defaultTo(false);
table.boolean("impossible_travel").notNullable().defaultTo(false);
table.integer("request_velocity").notNullable().defaultTo(0);
table.timestamp("last_login").nullable();
table.timestamp("password_changed_at").nullable();
table.timestamps(true, true);
table.index("last_login", "idx_security_lastLogin");
});

// RateLimits table
await knex.schema.createTable("rate_limits", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
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
table.integer("attempts").notNullable().defaultTo(0);
table.timestamp("last_attempt").nullable();
table.timestamp("lock_until").nullable();
table.unique(["user_id", "action"], "uniq_rate_limits_user_action");
table.index("lock_until", "idx_rate_limits_lockUntil");
});

// DeviceInfo table (shared for audit_log and login_history)
await knex.schema.createTable("device_info", (table) => {
table.increments("id").primary();
table.string("os", 50).notNullable();
table.string("browser", 50).notNullable();
table.string("device", 50).notNullable();
table.string("brand", 50).nullable();
table.string("model", 50).nullable();
table.boolean("is_bot").notNullable();
table.string("ip", 45).notNullable(); // Supports IPv6
table.string("location_city", 100).notNullable();
table.string("location_country", 100).notNullable();
table.decimal("location_latitude", 10, 8).notNullable();
table.decimal("location_longitude", 11, 8).notNullable();
table.string("location_source", 50).notNullable();
table.string("fingerprint", 255).notNullable();
table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
table.boolean("success").notNullable();
table.index("ip", "idx_device_info_ip");
table.index("fingerprint", "idx_device_info_fingerprint");
table.index("timestamp", "idx_device_info_timestamp");
});

// AuditLog table
await knex.schema.createTable("audit_log", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.timestamp("timestamp").notNullable().defaultTo(knex.fn.now());
table.enum("action", Object.values(SecurityAuditAction)).notNullable();
table.boolean("details_success").notNullable();
table.string("details_message", 255).nullable();
table
.integer("device_id")
.unsigned()
.nullable()
.references("id")
.inTable("device_info")
.onDelete("SET NULL");
table.index("timestamp", "idx_audit_log_timestamp");
table.index(["user_id", "action"], "idx_audit_log_user_action");
});

// LoginHistory table
await knex.schema.createTable("login_history", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table
.integer("device_id")
.unsigned()
.notNullable()
.references("id")
.inTable("device_info")
.onDelete("CASCADE");
table.timestamps(true, true);
table.index("user_id", "idx_login_history_user_id");
});

// PreviousPasswords table
await knex.schema.createTable("previous_passwords", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.string("password", 255).notNullable();
table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
table.index("user_id", "idx_previous_passwords_user_id");
});

// SocialProfiles table
await knex.schema.createTable("social_profiles", (table) => {
table.increments("id").primary();
table
.uuid("user_id")
.notNullable()
.references("\_id")
.inTable("users")
.onDelete("CASCADE");
table.string("provider", 50).notNullable();
table.string("profile_id", 255).notNullable();
table.timestamps(true, true);
table.unique(["user_id", "provider"], "uniq_social_profiles_user_provider");
});

// Trigger for audit logging on password/email changes
await knex.raw(`     DELIMITER //
    CREATE TRIGGER audit_user_changes
    BEFORE UPDATE ON users
    FOR EACH ROW
    BEGIN
      DECLARE device_id INT;
      SET device_id = NULL; -- Replace with actual device_id if available
      IF OLD.password != NEW.password THEN
        INSERT INTO audit_log (user_id, timestamp, action, details_success, details_message, device_id)
        VALUES (NEW._id, NOW(), 'PASSWORD_CHANGE', TRUE, 'Password updated', device_id);
      END IF;
      IF OLD.email != NEW.email THEN
        INSERT INTO audit_log (user_id, timestamp, action, details_success, details_message, device_id)
        VALUES (NEW._id, NOW(), 'EMAIL_CHANGE', TRUE, 'Email updated', device_id);
      END IF;
    END //
    DELIMITER ;
  `);
}

export async function down(knex: Knex): Promise<void> {
await knex.raw("DROP TRIGGER IF EXISTS audit_user_changes");
await knex.schema.dropTableIfExists("social_profiles");
await knex.schema.dropTableIfExists("previous_passwords");
await knex.schema.dropTableIfExists("login_history");
await knex.schema.dropTableIfExists("audit_log");
await knex.schema.dropTableIfExists("device_info");
await knex.schema.dropTableIfExists("rate_limits");
await knex.schema.dropTableIfExists("security");
await knex.schema.dropTableIfExists("verification");
await knex.schema.dropTableIfExists("auth_methods");
await knex.schema.dropTableIfExists("users");
}
