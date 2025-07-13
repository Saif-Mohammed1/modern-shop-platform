import crypto from "crypto";

import bcrypt from "bcryptjs";
import type { Knex } from "knex";

import {
  SecurityAuditAction,
  type AuditLogDetails,
} from "@/app/lib/types/audit.db.types";
import type {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import type { DeviceInfo, GeoLocation } from "@/app/lib/types/session.types";
import type {
  IAuditLogDB,
  ILoginHistoryDB,
  IPreviousPasswordsDB,
  IRateLimitsDB,
  ISecurityDB,
  IUserDB,
  IVerificationDB,
  accountAction,
  Preferences,
  UserCurrency,
  UserRole,
} from "@/app/lib/types/users.db.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

import type {
  CreateUserByAdminDTO,
  UpdateUserByAdminDTO,
  UserCreateDTO,
  // UserCreateDTO,
} from "../dtos/user.dto";
import { TokensService } from "../services/tokens.service";

import { BaseRepository } from "./BaseRepository";

export class UserRepository extends BaseRepository<IUserDB> {
  private tokensService: TokensService = new TokensService();
  constructor(knex: Knex) {
    super(knex, "users");
  }
  async createUser(
    dto: UserCreateDTO,
    trx: Knex.Transaction
  ): Promise<IUserDB> {
    const data = {
      _id: generateUUID(),
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,

      preferences_language: dto.preferences?.language as Preferences,
      preferences_currency: dto.preferences?.currency as UserCurrency,
    };

    const cleanedData = this.cleanedUpdates(data);
    const pre = await this.preSaveUser(cleanedData, true, trx);
    const [user] = await this.query(trx).insert(pre).returning("*");
    // const user = await this.query(trx).where("_id", pre._id).first(); // safer for UUID or email uniqueness
    //
    if (!user) {
      throw new AppError("User creation failed", 500);
    }
    return user; //this.sanitizeUser(user);
  }
  // async findUserById(id: string, options?: string): Promise<IUserDB | null> {
  //   if (!options) {
  //     return (await this.knex
  //       .findById(id)
  //       .select("+security")) as IUserDB | null;
  //   }
  //   return (await this.knex.findById(id).select(options)) as IUserDB | null;
  // }

  async findByEmail(email: string): Promise<IUserDB | null> {
    return (await this.query().where("email", email).first()) as IUserDB | null;
  }

  async lockUserAccount(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IRateLimitsDB>("rate_limits")
      .where("user_id", user_id)
      .whereIn("action", [
        "login",
        "passwordReset",
        "verification",
        "2fa",
        "backup_recovery",
      ])
      .update({
        lock_until: new Date(Date.now() + 1000 * 60 * 60), // 1 hour      },
      });
  }
  async unlockUserAccount(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IRateLimitsDB>("rate_limits")
      .whereIn("action", [
        "login",
        "passwordReset",
        "verification",
        "2fa",
        "backup_recovery",
      ])
      .where("user_id", user_id)
      .update({
        lock_until: null,
      });
  }

  // async trackVerification(
  //   user: IUserDB,
  //   success: boolean,
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   await this.knex.updateOne(
  //     { _id: user._id },
  //     {
  //       $push: {
  //         "verification.verificationHistory": {
  //           success,
  //           timestamp: new Date(),
  //         },
  //       },
  //     },
  //     { trx }
  //   );
  // }
  async trackLogin(
    user: IUserDB,
    device_info: DeviceInfo,
    success: boolean,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    //  const device_info = {}
    const id = generateUUID();
    await this.createDeviceFingerprintDB(
      {
        ...device_info,
        _id: id,
        user_id: user._id,

        source: "login_history",
      },
      trx
    );

    await query<ILoginHistoryDB>("login_history").insert({
      _id: generateUUID(),
      user_id: user._id,
      device_id: id,
      success,
      created_at: new Date(),
    });

    /** 
    // const update: any = {
    //   $push: {
    //     "security.loginHistory": {
    //       ...device_info,
    //       success,
    //       timestamp: new Date(),
    //     },
    //   },
    // };

    // Ensure $set exists before assigning properties
    // update.$set = update.$set || {};

    // if (!success) {
    //   const newLoginAttempts = (user?.security?.loginAttempts || 0) + 1;

    //   update.$inc = { "security.loginAttempts": 1 };

    //   if (newLoginAttempts >= 5) {
    //     update.$set["security.accountLockedUntil"] = new Date(
    //       Date.now() + 30 * 60 * 1000
    //     );
    //   }
    // } else {
    //   update.$set["security.loginAttempts"] = 0;
    //   update.$unset = { "security.accountLockedUntil": "" };
    // }

    // await this.knex.updateOne({ _id: user._id }, update);
  */
  }
  async setVerificationToken(
    user_id: string,
    verification_token: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    await query<IVerificationDB>("verification")
      .insert({
        user_id: user_id,
        verification_token: verification_token,
        verification_expires: expiry,
      })
      .onConflict("user_id")
      .merge({
        verification_token: verification_token,
        verification_expires: expiry,
      });
  }
  async updateLastLogin(
    user_id: IUserDB["_id"],
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx)
      .where("_id", user_id)
      .update({ last_login: new Date() });
  }
  async verifyUserEmail(
    token: string,
    trx?: Knex.Transaction
  ): Promise<IUserDB | null> {
    const query = trx ?? this.knex;
    const verification = await query<IVerificationDB>("verification")
      .where("verification_token", token)
      .andWhere("verification_expires", ">", new Date())
      .first(); // Retrieve only the first matching record
    if (!verification) {
      return null; // Token not found or expired
    }
    // Update the user document to set email_verified to true
    const [user] = await query<IUserDB>("users")
      .where("_id", verification.user_id)
      .update("email_verified", true)
      .returning("*");

    return user;
    // Return the updated user document
  }
  async generatePasswordResetToken(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed_token = this.tokensService.hashRestPasswordToken(resetToken);

    const query = trx ?? this.knex;
    const expiry = this.tokensService.getResetPasswordTokenExpiry();
    await query<IVerificationDB>("verification")
      .insert({
        user_id: user_id,
        verification_token: hashed_token,
        verification_expires: expiry,
      })
      .onConflict("user_id")
      .merge({
        verification_token: hashed_token,
        verification_expires: expiry,
      });

    return resetToken;
  }

  async validateResetPasswordEmailAndToken(
    token: string
    // email?: string
  ): Promise<IUserDB["_id"] | null> {
    const hashed_token = this.tokensService.hashRestPasswordToken(token);
    // const query: Record<string, any> = {
    //   "verification_token": hashed_token,
    //   "verification_expires": { $gt: new Date() },
    // };

    const query = await this.knex<IVerificationDB>("verification")
      .where("verification_token", hashed_token)
      .andWhere("verification_expires", ">", new Date())
      .first();
    if (!query) {
      return null;
    }
    return query.user_id;
    // if (email) {
    //   // query.email = email;
    //   query
    //     .innerJoin("users", "users._id", "verification.user_id") // Adjust to 'users.id' if needed
    //     .andWhere("users.email", email)
    //     .select("users.*"); // Return IUserDB fields
    // } else {
    //   query.select("verification.*"); // Return IVerificationDB fields
    // }

    // return (await query.first()) ?? null;
  }
  async createAuditLog(
    user_id: string,
    action: SecurityAuditAction,
    details: AuditLogDetails,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    const deviceId = generateUUID();

    await this.createDeviceFingerprintDB(
      {
        ...details.device,
        _id: deviceId,
        user_id: user_id,
        source: "audit_log",
      },
      trx
    );

    await query<IAuditLogDB>("audit_log").insert({
      _id: generateUUID(), // Generate a new UUID
      user_id: user_id,
      action,
      details_message: details.message || "unknown",
      details_success: details.success || false,
      device_id: deviceId,
      // timestamp: new Date(),
    });

    // example usage:
    // await this.repository.createAuditLog(user._id, "User updated", { email: user.email });
    // elso use this to track login attempts
    /**
     * await this.repository.createAuditLog(user._id, "Login attempt", {
     *  ipAddress: ip,
     * userAgent: ua,
     *
     */
  }
  async logSecurityAlert(
    userEmail: string,
    type: SecurityAuditAction,
    details: AuditLogDetails
  ): Promise<void> {
    const user = await this.findByEmail(userEmail);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    await this.createAuditLog(user._id, type, details);
    // await this.knex.findOneAndUpdate(
    //   { email: userEmail },
    //   {
    //     $push: {
    //       "security.auditLog": {
    //         timestamp: new Date(),
    //         action: type,
    //         details,
    //       },
    //     },
    //   }
    // );
  }
  async checkRateLimit(
    user_id: IUserDB["_id"],
    action:
      | "login"
      | "passwordReset"
      | "verification"
      | "2fa"
      | "backup_recovery"
  ) {
    const rateLimit = await this.knex<IRateLimitsDB>("rate_limits")
      .where("user_id", user_id)
      .andWhere("action", action)
      .first();

    const now = new Date();
    if (!rateLimit) {
      // No rate limit record found, user is not rate limited
      return;
    }

    // Check if still in lock period
    if (rateLimit.lock_until && rateLimit.lock_until > now) {
      const minutesLeft = Math.ceil(
        (rateLimit.lock_until.getTime() - now.getTime()) / 60000 // ms to minutes
      );
      throw new AppError(
        AuthTranslate[lang].userService.rateLimit(minutesLeft),
        429
      );
    }

    // Reset counter if window expired
    if (
      rateLimit.last_attempt &&
      now.getTime() - rateLimit.last_attempt.getTime() > 15 * 60 * 1000
    ) {
      // 15m window
      await this.knex<IRateLimitsDB>("rate_limits")
        .where("user_id", user_id)
        .andWhere("action", action)
        .update({
          attempts: 0,
        });
      // rateLimit.attempts = 0;
    }
  }
  async incrementRateLimit(
    user: IUserDB,
    action: accountAction,
    trx?: Knex.Transaction
  ): Promise<void> {
    let lock_until: Date | null = null;
    const query = trx ?? this.knex;
    const rateLimit = await query<IRateLimitsDB>("rate_limits")
      .where("user_id", user._id)
      .andWhere("action", action)
      .first();
    if (!rateLimit) {
      await query<IRateLimitsDB>("rate_limits").insert({
        _id: generateUUID(),
        user_id: user._id,
        action,
        attempts: 1,
        last_attempt: new Date(),
        lock_until: null,
      });
      return;
    }
    const attempts = (rateLimit.attempts || 0) + 1;
    const last_attempt = new Date();
    // Lock account if exceeds threshold
    if (attempts >= 5) {
      lock_until = new Date(Date.now() + 30 * 60 * 1000); // 30m lock
    }

    await query<IRateLimitsDB>("rate_limits")
      .where("user_id", user._id)
      .andWhere("action", action)
      .update({
        attempts,
        last_attempt,
        lock_until,
      });
  }

  async clearRateLimit(
    user_id: IUserDB["_id"],
    action: accountAction,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IRateLimitsDB>("rate_limits")
      .where("user_id", user_id)
      .andWhere("action", action)
      .update({
        attempts: 0,
        last_attempt: new Date(),
        lock_until: null,
      });
  }
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }
  async comparePassword(
    user: IUserDB,
    candidatePassword: string
  ): Promise<boolean> {
    if (!user.password) {
      return false;
    }

    return bcrypt.compare(candidatePassword, user.password);
  }
  // async isPreviousPassword(
  //   user_id:string,
  //   password: string
  // ): Promise<boolean> {
  //   const user = await this.knex.findById(user_id).select("+security");
  //   return user?.security.previousPasswords.includes(password) || false;
  // }
  async updatePassword(
    user_id: IUserDB["_id"],
    password: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const hashedPassword = await this.hashPassword(password);
    await this.query(trx).where("_id", user_id).update({
      password: hashedPassword,
      password_changed_at: new Date(),
    });
    // user.password = password;
    // user.verification.verification_token = undefined;
    // user.verification.verification_expires = undefined;
    // await user.save({ validateModifiedOnly: true, trx });
  }
  // async isPreviousPassword(
  //   user_id: IUserDB,
  //   candidatePassword: string
  // ): Promise<boolean> {
  //   const previousPasswords = await this.knex<IPreviousPasswordsDB>(
  //     "previous_passwords"
  //   )
  //     .where("user_id", user_id)
  //     .orderBy("created_at", "asc")
  //     .limit(5);
  //   // Compare against all hashed versions in history
  //   for (const oldPassword of previousPasswords) {
  //     if (await bcrypt.compare(candidatePassword, oldPassword.password)) {
  //       return true;
  //     }
  //   }
  //   return false;
  // }
  async isPreviousPassword(
    user_id: string,
    candidatePassword: string
  ): Promise<boolean> {
    // Fetch previous passwords
    const previousPasswords = await this.knex<IPreviousPasswordsDB>(
      "previous_passwords"
    )
      .where("user_id", user_id)
      .orderBy("created_at", "desc") // Use DESC to get newest first (more likely to match)
      .limit(5);

    // Parallelize bcrypt comparisons
    const comparisonPromises = previousPasswords.map((oldPassword) =>
      bcrypt.compare(candidatePassword, oldPassword.password)
    );
    const results = await Promise.all(comparisonPromises);

    // Return true if any comparison is true
    return results.some((isMatch) => isMatch);
  }
  async invalidateResetToken(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await Promise.all([
      query<IVerificationDB>("verification").where("user_id", user_id).update({
        verification_token: null,
        verification_expires: null,
      }),
      query<ISecurityDB>("security").where("user_id", user_id).update({
        two_factor_secret: null,
        two_factor_secret_expiry: null,
      }),
    ]);
    // await this.knex.findByIdAndUpdate(
    //   user_id,
    //   {
    //     $unset: {
    //       "verification.verification_token": 1,
    //       "verification.verification_expires": 1,

    //       "security.two_factor_secret": 1,
    //     },
    //     $set: {
    //       "security.two_factor_enabled": false,
    //     },
    //   },

    //   { trx, new: true } // Ensure the document is updated
    // );
  }
  async updateUserStatus(
    user_id: string,
    status: IUserDB["status"],
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IUserDB>("users")
      .where("_id", user_id)
      .update("status", status);
  }
  async updateUserRole(
    user_id: string,
    role: IUserDB["role"],
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<IUserDB>("users").where("_id", user_id).update("role", role);
  }
  async validateTempToken(tempToken: string): Promise<IUserDB | null> {
    const security = await this.knex<ISecurityDB>("security")
      .where("two_factor_secret", tempToken)
      .andWhere("two_factor_secret_expiry", ">", new Date())
      .first(); // Retrieve only the first matching record

    if (!security) {
      return null;
    }
    const user = await this.query().where("_id", security.user_id).first();
    // .findOne({
    //   "security.two_factor_secret": tempToken,
    //   "security.two_factor_secret_expiry": { $gt: new Date() },
    //   // status: "active",
    // })
    // .select("+security");

    return user ?? null;
  }
  async validateGenerateMFAToken(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<ISecurityDB | null> {
    const query = trx ?? this.knex;
    const security = await query<ISecurityDB>("security")
      .where("user_id", user_id)
      .andWhere("two_factor_secret", "is not", null)
      .andWhere("two_factor_secret_expiry", ">", new Date())
      .first();
    if (!security) {
      return null;
    }
    return security;
  }
  async generateMFAToken(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<string> {
    const tempToken = crypto.randomBytes(32).toString("hex");
    const query = trx ?? this.knex;
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5m expiry
    await query<ISecurityDB>("security")
      .insert({
        user_id: user_id,
        two_factor_secret: tempToken,
        two_factor_secret_expiry: expiry,
      })
      .onConflict("user_id")
      .merge({
        two_factor_secret: tempToken,
        two_factor_secret_expiry: expiry,
        updated_at: new Date(),
      });
    return tempToken;
  }
  async clearTwoFactorSecret(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const query = trx ?? this.knex;
    await query<ISecurityDB>("security").where("user_id", user_id).update({
      two_factor_secret: null,
      two_factor_secret_expiry: null,
    });
  }
  async createUserByAdmin(
    dto: CreateUserByAdminDTO,
    trx?: Knex.Transaction
  ): Promise<IUserDB> {
    const data: Pick<
      IUserDB,
      | "_id"
      | "name"
      | "email"
      | "phone"
      | "password"
      | "role"
      | "login_notification_sent"
      | "email_verified"
      | "phone_verified"
    > & {
      preferences_language?: Preferences;
      preferences_currency?: UserCurrency;
    } = {
      _id: generateUUID(),
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      role: dto.role as UserRole,
      preferences_language:
        (dto.preferences?.language as Preferences) || undefined,
      preferences_currency:
        (dto.preferences?.currency as UserCurrency) || undefined,
      login_notification_sent: false,
      email_verified: false,
      phone_verified: false,
    };
    const insertData = await this.preSaveUser(data, true, trx);
    const [user] = await this.query(trx).insert(insertData).returning("*");
    // const user = await this.query(trx).where("_id", insertData._id).first(); // safer for UUID or email uniqueness
    if (!user) {
      throw new AppError("Failed to create user", 500);
    }
    return user; //this.sanitizeUser(user);
  }
  async updateUserByAdmin(
    id: string,
    updates: UpdateUserByAdminDTO,
    trx?: Knex.Transaction
  ): Promise<IUserDB | null> {
    const cleanedUpdates = this.cleanedUpdates(updates);
    const [user] = await this.query(trx)
      .where("_id", id)
      .update(cleanedUpdates)
      .returning("*");
    return user;
    // return await this.knex<IAuditLogDB>("audit_log").insert({
    //   _id: generateUUID(),
    //   user_id: id,
    //   action: updates.auditAction,
    //   details_message: updates.auditMessage,
    //   details_success: updates.auditSuccess,
    //   {
    //     ...updates,
    //     $push: {
    //       "security.auditLog": {
    //         action: updates.auditAction,
    //         details: updates,
    //         timestamp: new Date(),
    //       },
    //     },
    //   },
    //   {
    //     new: true,
    //     trx,
    //   }
    // );
  }

  async deleteUserByAdmin(
    id: string,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    return await this.query(trx).where("_id", id).del();
  }
  async updateUserStatusByAdmin(
    user_id: string,
    status: IUserDB["status"],
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.updateUserStatus(user_id, status, trx);
  }
  async updateUserRoleByAdmin(
    user_id: string,
    role: IUserDB["role"],
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.updateUserRole(user_id, role, trx);
  }
  async updateUserPasswordByAdmin(
    user_id: string,
    password: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const user = await this.findById(user_id);
    if (!user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    await this.updatePassword(user._id, password, trx);
  }
  async updateUserEmailByAdmin(
    user_id: string,
    email: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx).where("_id", user_id).update({
      email,
      email_verified: false,
    });
  }
  async updateUserProfileByAdmin(
    user_id: string,
    updates: Partial<IUserDB>,
    trx?: Knex.Transaction
  ): Promise<IUserDB | null> {
    return await this.update(user_id, updates, trx);
  }
  async updateUserVerificationStatusByAdmin(
    user_id: string,
    email_verified: boolean,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx).where("_id", user_id).update({
      email_verified,
    });
  }
  // async updateUserSecurityByAdmin(
  //   user_id: string,
  //   updates: Partial<ISecurityDB>,
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   await this.knex.updateOne({ _id: user_id }, { security: updates }, { trx });
  // }
  // async updateUserVerificationByAdmin(
  //   user_id: string,
  //   updates: Partial<IVerificationDB>,
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   await this.knex.updateOne(
  //     { _id: user_id },
  //     { verification: updates },
  //     { trx }
  //   );
  // }
  async disable2FA(user_id: string, trx?: Knex.Transaction): Promise<void> {
    const query = trx ?? this.knex;
    await query<ISecurityDB>("security").where("user_id", user_id).update({
      two_factor_secret: null,
      two_factor_secret_expiry: null,
    });
    await this.query(trx).where("_id", user_id).update({
      two_factor_enabled: false,
    });
  }
  async enable2FA(user_id: string, trx?: Knex.Transaction): Promise<void> {
    await this.query(trx).where("_id", user_id).update({
      two_factor_enabled: true,
    });
  }
  async generateEmailChangeToken(
    user_id: string,
    email: string,
    trx?: Knex.Transaction
  ): Promise<string> {
    const { hashed_token, token } =
      this.tokensService.generateEmailChangeTokenAndHashed();
    const query = trx ?? this.knex;
    await query<IVerificationDB>("verification")
      .where("user_id", user_id)
      .update({
        email_change_token: hashed_token,
        email_change: email,
        email_change_expires: new Date(Date.now() + 10 * 60 * 1000),
      });
    return token;
  }
  async validateEmailChangeToken(
    token: string
    // email: string
  ): Promise<IVerificationDB | null> {
    const hashed_token = this.tokensService.hashEmailChangeToken(token);
    return (
      (await this.knex<IVerificationDB>("verification")
        .where("email_change_token", hashed_token)
        .andWhere("email_change_expires", ">", new Date())
        .first()) ?? null
    );
  }
  async processEmailChange(
    user_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const q = trx ?? this.knex;

    // 1. Get email_change from the verification table
    const verification = await q<IVerificationDB>("verification")
      .select("email_change")
      .where("user_id", user_id)
      .first();

    if (!verification?.email_change) {
      throw new Error("No pending email change found for this user.");
    }

    // 2. Update the user's email
    await this.query(trx).where("_id", user_id).update({
      email: verification.email_change,
      email_verified: false,
    });

    // 3. Clear the verification email change fields
    await q<IVerificationDB>("verification").where("user_id", user_id).update({
      email_change_token: null,
      email_change: null,
      email_change_expires: null,
    });
  }

  async updateName(
    user_id: string,
    name: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx).where("_id", user_id).update({
      name,
    });
  }
  async updateLoginNotificationSent(
    user_id: string,
    login_notification_sent: boolean,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx).where("_id", user_id).update({
      login_notification_sent,
    });
  }
  async findAllUsers(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IUserDB>> {
    const queryConfig: QueryBuilderConfig<IUserDB> = {
      allowedFilters: ["name", "email", "role", "status", "created_at"],
      searchFields: ["email"],
      // enableFullTextSearch: true,
      // allowedSorts: ["created_at", "updated_at"],
    };

    // const query = new URLSearchParams(options.query);
    // if (query.get("email")) {
    //   const email = query.get("email") as string;
    //   query.delete("email"); // ✅ remove the strict equality filter
    //   query.append("email[ili]", email); // ✅ add the ILIKE filter
    // }

    //   allowedSorts: ["created_at", "updated_at"] as Array<keyof IWishlist>,
    //   maxLimit: 100,
    const queryBuilder = new QueryBuilder<IUserDB>(
      this.knex,
      this.tableName,
      options.query,
      queryConfig
    );
    // this work around is to prevent non-admin users from seeing inactive products
    // and this work too
    //  fixedFilters: !isAdmin ? { active: true } : undefined,

    // if (!isAdmin) queryBuilder.filter.active = true;

    return await queryBuilder.execute();
  }
  private async preSaveUser(
    user: Partial<IUserDB>,
    isNew: boolean,
    trx?: Knex.Transaction
  ): Promise<Partial<IUserDB>> {
    if (user.password) {
      if (!isNew) {
        // Fetch the existing document to get the old hashed password
        const existingUser = await this.query(trx)
          .where("_id", user._id)

          .select("password", "_id")
          .first();
        if (existingUser) {
          const q = trx ?? this.knex;

          // save the old hashed password into the history
          await q<IPreviousPasswordsDB>("previous_passwords").insert({
            _id: generateUUID(),
            user_id: existingUser._id,
            password: existingUser.password,
          });
          // Limit password history to last 5
          const history = await q<IPreviousPasswordsDB>("previous_passwords")
            .where("user_id", existingUser._id)
            .orderBy("created_at", "asc");

          if (history.length > 5) {
            const toDelete = history.slice(0, history.length - 5);
            const idsToDelete = toDelete.map((p) => p._id);
            await q("previous_passwords").whereIn("_id", idsToDelete).del();
          }
        }
      }

      // Hash the new password
      user.password = await this.hashPassword(user.password);

      // Set password change timestamp
      user.password_changed_at = isNew ? null : new Date(Date.now() - 1000);
    }

    if (!isNew && user.email) {
      const existing = await this.query(trx)
        .select("email")
        .where("_id", user._id)
        .first();

      if (existing && existing.email !== user.email) {
        user.email_verified = false;
      }
    }

    return user;
  }
  async detectAnomalies(
    user: IUserDB,
    device_info: DeviceInfo,
    trx?: Knex.Transaction
  ) {
    const q = trx ?? this.knex;
    const MAX_LOGIN_HISTORY = 5; // Check last 5 logins
    const IMPOSSIBLE_TRAVEL_THRESHOLD = 800; // km/h
    const NEW_DEVICE_GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 1 week
    const loginHistory = (await q<ILoginHistoryDB>("login_history")
      .where("user_id", user._id)
      .orderBy("created_at", "desc")
      .innerJoin(
        "device_fingerprints",
        "login_history.device_id",
        "device_fingerprints._id"
      )
      .select(
        "login_history.*",
        this.knex.raw(
          `COALESCE(jsonb_build_object(
            'device', device_fingerprints.device,
            'os', device_fingerprints.os,
            'browser', device_fingerprints.browser,
            'ip', device_fingerprints.ip,
            'fingerprint', device_fingerprints.fingerprint
            'location', jsonb_build_object(
              'city', device_fingerprints.location_city,
              'country', device_fingerprints.location_country,
              'latitude', device_fingerprints.location_latitude,
              'longitude', device_fingerprints.location_longitude, 
              'source', device_fingerprints.location_source
        )), '{}'::json) as device_info`
        )
      )
      .limit(MAX_LOGIN_HISTORY)) as unknown as (ILoginHistoryDB & {
      device_info: { fingerprint: string; location: GeoLocation };
    })[];
    const recentLogins = loginHistory
      .map((login) => ({
        ...login,
        location: login.device_info.location,
      }))
      .filter((login) => login.success);

    // loginHistory.filter(
    //   (login: ILoginHistoryDB) => login.success
    // );

    // 1. Impossible Travel Detection
    if (recentLogins.length > 0 && device_info.location) {
      const distances = recentLogins.map((login) => {
        return this.calculateDistance(
          login.device_info.location,
          device_info.location
        );
      });

      const minDistance = Math.min(...distances);
      const maxSpeed =
        minDistance /
        ((Date.now() - recentLogins[0].created_at.getTime()) / 3600000);

      if (maxSpeed > IMPOSSIBLE_TRAVEL_THRESHOLD) {
        await Promise.all([
          q<ISecurityDB>("security")
            .where("user_id", user._id)
            .update({ impossible_travel: true }),

          // this.security.behavioralFlags.impossible_travel = true;
          this.createAuditLog(user._id, SecurityAuditAction.IMPOSSIBLE_TRAVEL, {
            success: true,
            device: device_info,
            message: `Detected travel speed of ${Math.round(maxSpeed)}km/h from ${recentLogins[0].location.country}`,
          }),
        ]);
      }
    }

    // 2. Device Fingerprint Analysis
    const knownDevices = new Set(
      loginHistory
        .filter(
          (login) =>
            login.created_at.getTime() > Date.now() - NEW_DEVICE_GRACE_PERIOD
        )
        .map((login) => login.device_info.fingerprint)
    );

    if (!knownDevices.has(device_info.fingerprint)) {
      // this.security.behavioralFlags.suspicious_device_change = true;
      await q<ISecurityDB>("security")
        .where("user_id", user._id)
        .update({ suspicious_device_change: true });

      // Send security alert only for truly new devices
      if (!user.login_notification_sent) {
        const { emailService } = await import("../services");

        await emailService.sendSecurityAlertEmail(user.email, {
          type: SecurityAuditAction.NEW_DEVICE,
          device: device_info,
          ipAddress: device_info.ip,
          location: `${device_info.location.city}, ${device_info.location.country} 
            ${recentLogins[0]?.location.city}, ${recentLogins[0]?.location.country}`,
        });

        user.login_notification_sent = true;
        await this.createAuditLog(
          user._id,
          SecurityAuditAction.NEW_DEVICE_ALERT_SENT,
          {
            success: true,
            device: device_info,
            message: `New device detected: ${device_info.device} (${device_info.os})`,
          }
        );
      }
    }

    // 3. Velocity Analysis
    const recentAttempts: {
      _id: string; // UUID
      user_id: string; // UUID
      device_id: string; // UUID
      success: boolean;
      created_at: Date;
    }[] = loginHistory.filter(
      (login: ILoginHistoryDB) =>
        Date.now() - login.created_at.getTime() < 3600000 && // 1 hour
        !login.success
    );

    if (recentAttempts.length > 5) {
      await Promise.all([
        // this.security.behavioralFlags.request_velocity = recentAttempts.length;
        q<ISecurityDB>("security")
          .where("user_id", user._id)
          .update({ request_velocity: recentAttempts.length }),

        // this.security.rateLimits.login.lock_until = new Date(Date.now() + 3600000); // 1 hour
        q<IRateLimitsDB>("rate_limits")
          .where("user_id", user._id)
          .andWhere("action", "login")
          .update({
            attempts: 0,
            last_attempt: new Date(),
            lock_until: new Date(Date.now() + 3600000), // 1 hour
          }),
      ]); // Penalize bots harder
      const { emailService } = await import("../services");

      await emailService.sendSecurityAlertEmail(user.email, {
        type: SecurityAuditAction.SUSPICIOUS_ACTIVITY,
        location: `${device_info.location.city}, ${device_info.location.country} `,
        // additionalInfo: {
        //   attempts: recentAttempts.length,
        //   locations: Array.from(
        //     new Set(
        //       recentAttempts.map((a) => a.location.country)
        //     )
        //   ),
        // },
      });
    }

    // 4. Bot Detection Escalation
    if (device_info.is_bot) {
      await Promise.all([
        q<IRateLimitsDB>("rate_limits")
          .where("user_id", user._id)
          .andWhere("action", "login")
          .update({
            attempts: 3,
            last_attempt: new Date(),
            lock_until: null,
          }),

        this.createAuditLog(
          user._id,

          SecurityAuditAction.BOT_DETECTED,
          {
            success: true,
            device: device_info,
            message: "Bot detected",
          }
        ),
      ]);
    }
  }
  private calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
    const R = 6371; // Earth radius in km
    const dLat = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
    const dLon = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.latitude * Math.PI) / 180) *
        Math.cos((loc2.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  sanitizeUser(user: IUserDB): Omit<IUserDB, "password"> {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  // async anonymizeSecurityData  (user_id: IUserDB['_id']) {
  //   const tokensService = new TokensService();
  //   return {
  //     ...securityData,
  //     loginHistory:
  //       securityData.loginHistory?.map((entry) => ({
  //         ...entry,
  //         timestamp: entry?.timestamp.toISOString().split("T")[0],
  //         ip: tokensService.hashIpAddress(entry.ip),
  //         fingerprint: tokensService.hashFingerprint(entry.fingerprint),
  //       })) || [],

  //     auditLog:
  //       securityData.auditLog?.map((entry) => ({
  //         ...entry,
  //         timestamp: entry?.timestamp.toISOString().split("T")[0],

  //         details: {
  //           ...entry.details,
  //           device: entry.details.device
  //             ? {
  //                 ...entry.details.device,
  //                 ip: entry.details.device.ip
  //                   ? tokensService.hashIpAddress(entry.details.device.ip)
  //                   : null,
  //                 fingerprint: entry.details.device.fingerprint
  //                   ? tokensService.hashFingerprint(
  //                       entry.details.device.fingerprint
  //                     )
  //                   : null,
  //               }
  //             : null,
  //         },
  //       })) || [],

  //     rateLimits: securityData.rateLimits
  //       ? Object.fromEntries(
  //           Object.entries(securityData.rateLimits).map(
  //             ([key, val]: [
  //               string,
  //               { attempts: number; last_attempt: Date; lock_until: Date },
  //             ]) => [
  //               key,
  //               {
  //                 locked: !!val.lock_until && new Date(val.lock_until) > new Date(),
  //                 last_attempt: val.last_attempt
  //                   ? val.last_attempt.toISOString().split("T")[0]
  //                   : null,
  //                 attempts: val.attempts,
  //               },
  //             ]
  //           )
  //         )
  //       : {},
  //   };
  // };
}
