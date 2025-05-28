To convert the provided Mongoose schema to MySQL using Knex.js and MySQL2 with TypeScript, follow these steps:

### 1. Set Up Knex Configuration

**knexfile.ts**

```typescript
import type { KnexConfig } from "knex";
import "dotenv/config";

const config: KnexConfig = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || "3306"),
  },
  migrations: {
    directory: "./migrations",
    tableName: "knex_migrations",
  },
  seeds: {
    directory: "./seeds",
  },
};

export default config;
```

### 2. Create Database Migrations

**Initial Migration (users table)**

```typescript
// migrations/202401010000_create_users.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name", 50).notNullable();
    table.string("email").notNullable().unique();
    table.string("phone");
    table.string("password").notNullable();
    table
      .enum("role", ["customer", "admin", "moderator"])
      .notNullable()
      .defaultTo("customer");
    table
      .enum("status", ["active", "inactive", "suspended", "deleted"])
      .notNullable()
      .defaultTo("active");
    table.boolean("login_notification_sent").notNullable().defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    table.index(["email"], "idx_users_email");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("users");
}
```

**Security Settings Migration**

```typescript
// migrations/202401010001_create_user_security.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_security", (table) => {
    table
      .uuid("user_id")
      .primary()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("two_factor_secret");
    table.timestamp("two_factor_secret_expiry");
    table.boolean("two_factor_enabled").defaultTo(false);
    table.timestamp("password_changed_at");
    table.timestamp("last_login");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_security");
}
```

### 3. Define TypeScript Interfaces

**user.types.ts**

```typescript
export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  DELETED = "deleted",
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  login_notification_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserSecurity {
  user_id: number;
  two_factor_secret?: string;
  two_factor_secret_expiry?: Date;
  two_factor_enabled: boolean;
  password_changed_at?: Date;
  last_login?: Date;
}
```

### 4. Implement User Service with Security Features

**user.service.ts**

```typescript
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { knex } from "../db";
import { User, UserSecurity } from "./user.types";

export class UserService {
  async createUser(
    userData: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return knex.transaction(async (trx) => {
      const [user] = await trx("users")
        .insert({
          ...userData,
          password: hashedPassword,
        })
        .returning("*");

      await trx("user_security").insert({
        user_id: user.id,
        two_factor_enabled: false,
      });

      return user;
    });
  }

  async comparePassword(
    user_id: number,
    candidatePassword: string
  ): Promise<boolean> {
    const user = await knex("users")
      .select("password")
      .where("id", user_id)
      .first();

    return user ? bcrypt.compare(candidatePassword, user.password) : false;
  }

  async createPasswordResetToken(user_id: number): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed_token = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    await knex("users")
      .where("id", user_id)
      .update({
        reset_token: hashed_token,
        reset_token_expires: knex.raw("DATE_ADD(NOW(), INTERVAL 10 MINUTE)"),
      });

    return resetToken;
  }
}
```

### 5. Add Additional Migrations for Related Tables

**Login History Migration**

```typescript
// migrations/202401010002_create_login_history.ts
import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("user_login_history", (table) => {
    table.increments("id").primary();
    table.uuid("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.string("os").notNullable();
    table.string("browser").notNullable();
    table.string("device").notNullable();
    table.string("ip").notNullable();
    table.string("country").notNullable();
    table.decimal("latitude", 9, 6).notNullable();
    table.decimal("longitude", 9, 6).notNullable();
    table.timestamp("timestamp").defaultTo(knex.fn.now());
    table.boolean("success").notNullable();

    table.index(["user_id", "timestamp"], "idx_login_history_user_time");
    table.index(["ip"], "idx_login_history_ip");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("user_login_history");
}
```

### 6. Implement Security Features in Service

```typescript
// Add to user.service.ts
async trackLoginAttempt(
  user_id: number,
  device_info: {
    os: string;
    browser: string;
    device: string;
    ip: string;
    country: string;
    latitude: number;
    longitude: number;
  },
  success: boolean
): Promise<void> {
  await knex('user_login_history').insert({
    user_id: user_id,
    ...device_info,
    success,
  });
}

async updateSecurityFlags(user_id: number, flags: Partial<UserSecurity>): Promise<void> {
  await knex('user_security')
    .where('user_id', user_id)
    .update(flags);
}
```

### 7. Run Migrations

```bash
npx knex migrate:latest
```

This implementation provides:

1. MySQL schema definitions using Knex migrations
2. TypeScript interfaces for type safety
3. Transactional operations for data consistency
4. Security features like password hashing and reset tokens
5. Login history tracking
6. Two-factor authentication support

Key differences from MongoDB implementation:

- Relational database structure with multiple tables
- Transactions for complex operations
- Explicit schema definitions
- No embedded documents (uses table relationships)
- Application-layer implementation of MongoDB-like features

Remember to handle database indexes, connection pooling, and environment variables appropriately in production.
