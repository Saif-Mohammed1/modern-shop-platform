import { BaseRepository } from "./BaseRepository";
import { ClientSession, Model } from "mongoose";
import crypto from "crypto";
import { DeviceInfo } from "@/app/lib/types/session.types";
import { AuditAction, AuditLogDetails } from "@/app/lib/types/audit.types";
import { TokensService } from "../services/tokens.service";
import { IUser } from "../models/User.model";
import {
  CreateUserByAdminDTO,
  UpdateUserByAdminDTO,
  UserCreateDTO,
} from "../dtos/user.dto";
import { QueryBuilder } from "@/app/lib/utilities/queryBuilder";
import {
  QueryBuilderConfig,
  QueryBuilderResult,
  QueryOptionConfig,
} from "@/app/lib/types/queryBuilder.types";
import { accountAction } from "@/app/lib/types/users.types";
export class UserRepository extends BaseRepository<IUser> {
  private tokensService: TokensService = new TokensService();
  constructor(model: Model<IUser>) {
    super(model);
  }
  async createUser(
    dto: UserCreateDTO,
    session?: ClientSession
  ): Promise<IUser> {
    const [user] = await this.model.create([dto], { session });
    // none of them worked for me
    // const user = new this.model(dto);
    // await user.save({ session }); //
    return user;
  }

  async findById(id: string, options?: string): Promise<IUser | null> {
    if (!options) {
      return this.model.findById(id).select("+security");
    }
    return this.model.findById(id).select(options);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select("+password +security");
  }

  async update(
    id: string,
    updates: Partial<IUser>,
    session?: ClientSession
  ): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(id, updates, {
      new: true,
      session,
    });
  }
  async lockUserAccount(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        "security.rateLimits.login.lockUntil": new Date(
          Date.now() + 1000 * 60 * 60
        ), // 1 hour      },
        "security.rateLimits.passwordReset.lockUntil": new Date(
          Date.now() + 1000 * 60 * 60
        ), // 1 hour      },
        "security.rateLimits.verification.lockUntil": new Date(
          Date.now() + 1000 * 60 * 60
        ), // 1 hour      },
        "security.rateLimits.2fa.lockUntil": new Date(
          Date.now() + 1000 * 60 * 60
        ), // 1 hour      },
        "security.rateLimits.backup_recovery.lockUntil": new Date(
          Date.now() + 1000 * 60 * 60
        ), // 1 hour      },
      },
      { session }
    );
  }
  async unlockUserAccount(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        $unset: {
          "security.rateLimits.login.lockUntil": "",
          "security.rateLimits.passwordReset.lockUntil": "",
          "security.rateLimits.verification.lockUntil": "",
          "security.rateLimits.2fa.lockUntil": "",
          "security.rateLimits.backup_recovery.lockUntil": "",
        },
      },
      { session }
    );
  }
  async delete(id: string, session?: ClientSession): Promise<boolean> {
    const result = await this.model.deleteOne({ _id: id }, { session });
    return result.deletedCount === 1;
  }
  async trackVerification(
    user: IUser,
    success: boolean,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: user._id },
      {
        $push: {
          "verification.verificationHistory": {
            success,
            timestamp: new Date(),
          },
        },
      },
      { session }
    );
  }
  async trackLogin(
    user: IUser,
    deviceInfo: DeviceInfo,
    success: boolean,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: user._id },

      {
        $push: {
          "security.loginHistory": {
            ...deviceInfo,
            success,
            timestamp: new Date(),
          },
        },
        // $set: {
        //   "security.lastLogin": new Date(),
        //   "security.loginAttempts": success ? 0 : user.security.rateLimits.login + 1,
        //   "security.accountLockedUntil": success ? undefined : new Date(Date.now() + 30 * 60 * 1000),
        // },
      },
      { session }
    );
    /** 
    // const update: any = {
    //   $push: {
    //     "security.loginHistory": {
    //       ...deviceInfo,
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

    // await this.model.updateOne({ _id: user._id }, update);
  */
  }
  async setVerificationToken(
    userId: string,
    verificationToken: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        "verification.verificationToken": verificationToken,
        "verification.verificationExpires": new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
      { session }
    );
  }
  async updateLastLogin(userId: IUser["_id"]): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      { "security.lastLogin": new Date() }
    );
  }
  async verifyUserEmail(
    token: string,
    session?: ClientSession
  ): Promise<IUser | null> {
    return await this.model.findOneAndUpdate(
      {
        "verification.verificationToken": token,
        "verification.verificationExpires": { $gt: new Date() },
      },
      {
        "verification.emailVerified": true,
        "verification.verificationToken": "",
        "verification.verificationExpires": "",
      },
      { new: true, session }
    );
  }
  async generatePasswordResetToken(
    userId: string,
    session?: ClientSession
  ): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = this.tokensService.hashRestPasswordToken(resetToken);

    await this.model.updateOne(
      { _id: userId },
      {
        "verification.verificationToken": hashedToken,
        "verification.verificationExpires":
          this.tokensService.getResetPasswordTokenExpiry(),
      },
      { session }
    );

    return resetToken;
  }

  async validateResetPasswordEmailAndToken(
    token: string,
    email?: string
  ): Promise<IUser | null> {
    const hashedToken = this.tokensService.hashRestPasswordToken(token);
    const query: any = {
      "verification.verificationToken": hashedToken,
      "verification.verificationExpires": { $gt: new Date() },
    };
    if (email) {
      query.email = email;
    }

    return this.model.findOne(query).select("+security");
  }
  async createAuditLog(
    userId: string,
    action: AuditAction,
    details: AuditLogDetails,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        $push: {
          "security.auditLog": {
            action,
            details,
            timestamp: new Date(),
          },
        },
      },
      { session }
    );
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
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
  async incrementRateLimit(
    user: IUser,
    action: accountAction,
    session?: ClientSession
  ): Promise<void> {
    const rateLimit = user.security.rateLimits[action];
    rateLimit.attempts = (rateLimit.attempts || 0) + 1;
    rateLimit.lastAttempt = new Date();
    // Lock account if exceeds threshold
    if (rateLimit.attempts >= 5) {
      rateLimit.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30m lock
    }

    await this.model.updateOne(
      { _id: user._id },
      {
        [`security.rateLimits.${action}`]: rateLimit,
      },
      { session }
    );
  }

  async clearRateLimit(
    user: IUser,
    action: accountAction,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: user._id },
      {
        [`security.rateLimits.${action}`]: {
          attempts: 0,
          lastAttempt: new Date(),
          lockUntil: "",
        },
      },
      { session }
    );
  }
  // async isPreviousPassword(
  //   userId:string,
  //   password: string
  // ): Promise<boolean> {
  //   const user = await this.model.findById(userId).select("+security");
  //   return user?.security.previousPasswords.includes(password) || false;
  // }
  async updatePassword(
    user: IUser,
    password: string,
    session?: ClientSession
  ): Promise<void> {
    user.password = password;
    // user.verification.verificationToken = undefined;
    // user.verification.verificationExpires = undefined;
    await user.save({ validateModifiedOnly: true, session });
  }
  async invalidateResetToken(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.findByIdAndUpdate(
      userId,
      {
        $unset: {
          "verification.verificationToken": 1,
          "verification.verificationExpires": 1,

          "security.twoFactorSecret": 1,
        },
        $set: {
          "security.twoFactorEnabled": false,
        },
      },

      { session, new: true } // Ensure the document is updated
    );
  }
  async updateUserStatus(
    userId: string,
    status: IUser["status"],
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne({ _id: userId }, { status }, { session });
  }
  async updateUserRole(
    userId: string,
    role: IUser["role"],
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne({ _id: userId }, { role }, { session });
  }
  async validateTempToken(tempToken: string): Promise<IUser | null> {
    const user = await this.model
      .findOne({
        "security.twoFactorSecret": tempToken,
        "security.twoFactorSecretExpiry": { $gt: new Date() },
        // status: "active",
      })
      .select("+security");

    return user;
  }
  async generateMFAToken(
    userId: string,
    session?: ClientSession
  ): Promise<string> {
    const tempToken = crypto.randomBytes(32).toString("hex");
    await this.model.updateOne(
      { _id: userId },
      {
        $set: {
          "security.twoFactorSecret": tempToken,
          "security.twoFactorSecretExpiry": new Date(
            Date.now() + 5 * 60 * 1000
          ), // 5m expiry
        },
      },
      { session }
    );
    return tempToken;
  }
  async clearTwoFactorSecret(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },

      {
        $unset: {
          "security.twoFactorSecret": "",
          "security.twoFactorSecretExpiry": "",
        },
      },
      { session }
    );
  }
  async createUserByAdmin(
    dto: CreateUserByAdminDTO,
    session?: ClientSession
  ): Promise<IUser> {
    const [user] = await this.model.create([dto], { session });
    return user;
  }
  async updateUserByAdmin(
    id: string,
    updates: UpdateUserByAdminDTO,
    session?: ClientSession
  ): Promise<IUser | null> {
    return await this.model.findByIdAndUpdate(
      id,
      {
        ...updates,
        $push: {
          "security.auditLog": {
            action: updates.auditAction,
            details: updates,
            timestamp: new Date(),
          },
        },
      },
      {
        new: true,
        session,
      }
    );
  }

  async deleteUserByAdmin(
    id: string,
    session?: ClientSession
  ): Promise<boolean> {
    return this.delete(id, session);
  }
  async updateUserStatusByAdmin(
    userId: string,
    status: IUser["status"],
    session?: ClientSession
  ): Promise<void> {
    return this.updateUserStatus(userId, status, session);
  }
  async updateUserRoleByAdmin(
    userId: string,
    role: IUser["role"],
    session?: ClientSession
  ): Promise<void> {
    return this.updateUserRole(userId, role, session);
  }
  async updateUserPasswordByAdmin(
    userId: string,
    password: string,
    session?: ClientSession
  ): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    await this.updatePassword(user, password, session);
  }
  async updateUserEmailByAdmin(
    userId: string,
    email: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne({ _id: userId }, { email }, { session });
  }
  async updateUserProfileByAdmin(
    userId: string,
    updates: Partial<IUser>,
    session?: ClientSession
  ): Promise<IUser | null> {
    return this.update(userId, updates, session);
  }
  async updateUserVerificationStatusByAdmin(
    userId: string,
    emailVerified: boolean,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      { "verification.emailVerified": emailVerified },
      { session }
    );
  }
  async updateUserSecurityByAdmin(
    userId: string,
    updates: Partial<IUser["security"]>,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      { security: updates },
      { session }
    );
  }
  async updateUserVerificationByAdmin(
    userId: string,
    updates: Partial<IUser["verification"]>,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      { verification: updates },
      { session }
    );
  }
  async disable2FA(userId: string, session?: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        $unset: {
          "security.twoFactorSecret": "",
        },
        $set: {
          "security.twoFactorEnabled": false,
        },
      },

      { session }
    );
  }
  async enable2FA(userId: string, session?: ClientSession): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        "security.twoFactorEnabled": true,
      },
      { session }
    );
  }
  async generateEmailChangeToken(
    userId: string,
    email: string,
    session?: ClientSession
  ): Promise<string> {
    const { hashedToken, token } =
      this.tokensService.generateEmailChangeTokenAndHashed();
    await this.model.updateOne(
      { _id: userId },
      {
        "verification.emailChangeToken": hashedToken,
        "verification.emailChange": email,
        "verification.emailChangeExpires": new Date(
          Date.now() + 10 * 60 * 1000
        ),
      },
      { session }
    );
    return token;
  }
  async validateEmailChangeToken(
    token: string
    // email: string
  ): Promise<IUser | null> {
    const hashedToken = this.tokensService.hashEmailChangeToken(token);
    return this.model.findOne({
      "verification.emailChangeToken": hashedToken,
      // "verification.emailChange": email,
      "verification.emailChangeExpires": { $gt: new Date() },
    });
  }
  async processEmailChange(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        email: "$verification.emailChange",
        $unset: {
          "verification.emailChange": "",
          "verification.emailChangeToken": "",
          "verification.emailChangeExpires": "",
        },
      },
      { session }
    );
  }
  async updateName(
    userId: string,
    name: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      {
        _id: userId,
      },
      { name },
      { session }
    );
  }
  async findAllUsers(
    options: QueryOptionConfig
  ): Promise<QueryBuilderResult<IUser> | []> {
    const queryConfig: QueryBuilderConfig<IUser> = {
      allowedFilters: ["name", "email", "role", "status", "createdAt"].filter(
        Boolean
      ) as Array<keyof IUser>,
      searchFields: ["name", "email"],
      // allowedSorts: ["createdAt", "updatedAt"],
    };

    //   allowedSorts: ["createdAt", "updatedAt"] as Array<keyof IWishlist>,
    //   maxLimit: 100,
    const queryBuilder = new QueryBuilder<IUser>(
      this.model,
      options.query,
      queryConfig
    );
    // this work around is to prevent non-admin users from seeing inactive products
    // and this work too
    //  fixedFilters: !isAdmin ? { active: true } : undefined,

    // if (!isAdmin) queryBuilder.filter.active = true;

    return await queryBuilder.execute();
  }
}
