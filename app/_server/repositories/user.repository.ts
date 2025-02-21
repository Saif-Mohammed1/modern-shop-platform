import { BaseRepository } from "./BaseRepository";
import { ClientSession, Model } from "mongoose";
import crypto from "crypto";
import { DeviceInfo } from "@/app/lib/types/refresh.types";
import { AuditAction } from "@/app/lib/types/audit.types";
import { TokensService } from "../services/tokens.service";
import { IUser } from "../models/User.model";
import { UserCreateDTO } from "../dtos/user.dto";
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

  async findById(id: string): Promise<IUser | null> {
    return this.model.findById(id).select("+security");
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email }).select("+password +security");
  }

  async update(
    id: string,
    updates: Partial<IUser>,
    session?: ClientSession
  ): Promise<IUser | null> {
    return this.model.findByIdAndUpdate(id, updates, { new: true, session });
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
    return this.model.findOneAndUpdate(
      {
        "verification.verificationToken": token,
        "verification.verificationExpires": { $gt: new Date() },
      },
      {
        "verification.emailVerified": true,
        "verification.verificationToken": undefined,
        "verification.verificationExpires": undefined,
      },
      { session }
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
    details: any,
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
  async generateMFAToken(
    userId: string,
    session?: ClientSession
  ): Promise<string> {
    const tempToken = crypto.randomBytes(32).toString("hex");
    this.model.updateOne(
      { _id: userId },
      {
        "security.twoFactorSecret": tempToken,
        "security.twoFactorSecretExpiry": new Date(Date.now() + 5 * 60 * 1000),
      },
      { session }
    );
    return tempToken;
  }
  async startSession(): Promise<ClientSession> {
    return this.model.db.startSession();
  }
  async incrementRateLimit(
    user: IUser,
    action: "login" | "passwordReset" | "verification",
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
    action: "login" | "passwordReset" | "verification",
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: user._id },
      {
        [`security.rateLimits.${action}`]: {
          attempts: 0,
          lastAttempt: new Date(),
          lockUntil: undefined,
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
    await this.model.updateOne(
      { _id: userId },
      {
        "verification.verificationToken": undefined,
        "verification.verificationExpires": undefined,
      },
      { session }
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
  async clearTwoFactorSecret(
    userId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { _id: userId },
      {
        "security.twoFactorSecret": undefined,
        "security.twoFactorSecretExpiry": undefined,
      },
      { session }
    );
  }
  async createUserByAdmin(
    dto: UserCreateDTO,
    session?: ClientSession
  ): Promise<IUser> {
    return this.createUser(dto, session);
  }
  async updateUserByAdmin(
    id: string,
    updates: Partial<IUser>,
    session?: ClientSession
  ): Promise<IUser | null> {
    return this.update(id, updates, session);
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
 
}
