import { Document, Model, Schema, models, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { DeviceInfo } from "@/app/lib/types/refresh.types";
import { AuditAction } from "@/app/lib/types/audit.types";
import AppError from "@/app/lib/utilities/appError";
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

export enum AuthMethod {
  EMAIL = "email",
  GOOGLE = "google",
  FACEBOOK = "facebook",
  APPLE = "apple",
}

interface ILoginHistory extends DeviceInfo {
  timestamp: Date;
  //   ipAddress: string;
  //   userAgent: string;
  success: boolean;
}
interface IAuditLog {
  timestamp: Date;
  action: AuditAction;
  details: string;
}
interface IRateLimits {
  login: {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  passwordReset: {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  verification: {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
}

interface IBehavioralFlags {
  suspiciousDeviceChange: boolean;
  impossibleTravel: boolean;
  requestVelocity: number; // Requests per hour
}
interface ISecurity {
  twoFactorSecret?: string;
  twoFactorSecretExpiry?: Date;
  twoFactorEnabled: boolean;
  rateLimits: IRateLimits;
  behavioralFlags: IBehavioralFlags;
  auditLog: IAuditLog[];
  lastLogin?: Date;
  loginHistory: ILoginHistory[];
  previousPasswords: string[];
  passwordChangedAt?: Date;
}

interface IVerification {
  emailVerified: boolean;
  phoneVerified: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
}

interface IPreferences {
  language: string;
  currency: string;
  marketingOptIn: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  authMethods: AuthMethod[];
  preferences: IPreferences;
  loginNotificationSent: boolean;

  security: ISecurity;
  verification: IVerification;
  socialProfiles: Map<string, string>;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPreviousPassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  generateTwoFactorSecret(): void;
  isAccountLocked(action: "login" | "passwordReset" | "verification"): boolean;
  trackLoginAttempt(
    ipAddress: string,
    userAgent: string,
    success: boolean
  ): void;

  // Statics
  checkRateLimit(action: "login" | "passwordReset" | "verification"): void;
  incrementRateLimit(
    action: "login" | "passwordReset" | "verification"
  ): Promise<void>;
  detectAnomalies(deviceInfo: DeviceInfo): void;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    phone: {
      type: String,
      validate: {
        validator: (v: string) => validator.isMobilePhone(v),
        message: "Please provide a valid phone number",
      },
    },
    password: {
      type: String,
      select: false,
      required: [true, "Password is required"],
      minlength: [10, "Password must be at least 10 characters"],
      maxlength: [40, "Password cannot exceed 40 characters"],
      validate: {
        validator: (v: string) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(
            v
          ),
        message:
          "Password must contain at least one uppercase, one lowercase, one number, and one special character",
      },
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
    },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
    authMethods: {
      type: [String],
      enum: Object.values(AuthMethod),
      default: [AuthMethod.EMAIL],
    },

    preferences: {
      language: {
        type: String,
        default: "uk",
        enum: ["en", "es", "fr", "de", "uk"],
      },
      currency: {
        type: String,
        default: "UAH",
        enum: ["USD", "EUR", "GBP", "UAH"],
      },
      marketingOptIn: {
        type: Boolean,
        default: false,
      },
    },
    loginNotificationSent: {
      type: Boolean,
      default: false,
    },

    security: {
      twoFactorSecret: { type: String, select: false },
      twoFactorSecretExpiry: Date,
      twoFactorEnabled: { type: Boolean, default: false },
      rateLimits: {
        login: {
          attempts: { type: Number, default: 0 },
          lastAttempt: Date,
          lockUntil: Date,
        },
        passwordReset: {
          attempts: { type: Number, default: 0 },
          lastAttempt: Date,
          lockUntil: Date,
        },
        verification: {
          attempts: { type: Number, default: 0 },
          lastAttempt: Date,
          lockUntil: Date,
        },
      },
      behavioralFlags: {
        suspiciousDeviceChange: { type: Boolean, default: false },
        impossibleTravel: { type: Boolean, default: false },
        requestVelocity: { type: Number, default: 0 },
      },
      lastLogin: Date,
      auditLog: [
        {
          timestamp: { type: Date, default: Date.now },

          action: {
            type: String,
            enum: Object.values(AuditAction),
            required: true,
          }, // ✅ تحديد نوع الـ enum
          details: { type: Object, required: true }, // ✅ استبدال String بـ Object

          _id: false,
        },
      ],
      loginHistory: [
        {
          os: { type: String, required: true },
          browser: { type: String, required: true },
          device: { type: String, required: true },
          brand: { type: String },
          model: { type: String },
          isBot: { type: Boolean, required: true },
          ip: { type: String, required: true },
          location: { type: String },
          fingerprint: { type: String, required: true, index: true },
          timestamp: { type: Date, default: Date.now },
          success: { type: Boolean, required: true },
          _id: false,
        },
      ],
      previousPasswords: [String],
      passwordChangedAt: Date,
    },
    verification: {
      emailVerified: {
        type: Boolean,
        default: false,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      verificationToken: String,
      verificationExpires: Date,
    },
    socialProfiles: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.security;
        return ret;
      },
    },
  }
);

// Plugins
// UserSchema.plugin(auditPlugin);

// Indexes
UserSchema.index(
  { email: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
UserSchema.index({ "security.lastLogin": -1 });
UserSchema.index({ "security.loginHistory.ip": 1 });
UserSchema.index({ "verification.emailVerified": 1 });
UserSchema.index({
  "security.rateLimits.login.lockUntil": 1,
  "security.rateLimits.passwordReset.lockUntil": 1,
  "security.rateLimits.verification.lockUntil": 1,
});

UserSchema.index({
  "security.behavioralFlags.suspiciousDeviceChange": 1,
  "security.behavioralFlags.impossibleTravel": 1,
});

// Middleware
UserSchema.pre<IUser>("save", async function (next) {
  // Only run when password is modified
  if (this.isModified("password")) {
    try {
      // Move current password to history before updating
      if (!this.isNew) {
        this.security.previousPasswords.push(this.password);

        // Keep only last 5 passwords
        if (this.security.previousPasswords.length > 5) {
          this.security.previousPasswords.shift();
        }
      }

      // Hash new password
      this.password = await bcrypt.hash(this.password, 12);

      // Set password change timestamp
      this.security.passwordChangedAt = this.isNew
        ? undefined
        : new Date(Date.now() - 1000);
    } catch (error) {
      return next(error as Error);
    }
  }

  if (this.isModified("email")) {
    this.verification.emailVerified = false;
  }

  next();
});
UserSchema.pre<IUser>("save", function (next) {
  if (this.isModified("security.rateLimits")) {
    // Automatic lockout escalation
    if (this.security.rateLimits.login.attempts >= 3) {
      this.security.behavioralFlags.requestVelocity =
        this.security.loginHistory.filter(
          (l) => Date.now() - l.timestamp.getTime() < 3600000
        ).length;
    }
  }
  next();
});
// Enhanced Methods
UserSchema.methods.checkRateLimit = function (
  action: "login" | "passwordReset" | "verification"
) {
  const now = new Date();
  const rateLimit = this.security.rateLimits[action];

  // Check if still in lock period
  if (rateLimit.lockUntil && rateLimit.lockUntil > now) {
    const minutesLeft = Math.ceil(
      (rateLimit.lockUntil.getTime() - now.getTime()) / 60000 // ms to minutes
    );
    throw new AppError(
      `Too many attempts. Try again in ${minutesLeft} minutes`,
      429
    );
  }

  // Reset counter if window expired
  if (
    rateLimit.lastAttempt &&
    now.getTime() - rateLimit.lastAttempt.getTime() > 15 * 60 * 1000
  ) {
    // 15m window
    rateLimit.attempts = 0;
  }
};

UserSchema.methods.incrementRateLimit = async function (
  action: "login" | "passwordReset" | "verification"
) {
  const rateLimit = this.security.rateLimits[action];
  rateLimit.attempts = (rateLimit.attempts || 0) + 1;
  rateLimit.lastAttempt = new Date();

  // 🔥 Notify Mongoose that the nested path has changed
  //   this.markModified("security.rateLimits");

  // Lock account if exceeds threshold
  if (rateLimit.attempts >= 5) {
    rateLimit.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30m lock
  }
  //   // Explicitly save the document
  //   await this.save(); // ✅ Ensure this is awaited
};

// UserSchema.methods.detectAnomalies = function (deviceInfo: DeviceInfo) {
//   const lastLogin = this.security.loginHistory.slice(-1)[0];

//   // Impossible travel detection
//   if (lastLogin && deviceInfo.location) {
//     const distance = calculateDistance(lastLogin.location, deviceInfo.location);
//     const timeDiff = Date.now() - lastLogin.timestamp.getTime();
//     if (distance / (timeDiff / 3600000) > 1000) {
//       // 1000 km/h
//       this.security.behavioralFlags.impossibleTravel = true;
//     }
//   }

//   // Device fingerprint change
//   if (lastLogin && deviceInfo.fingerprint !== lastLogin.fingerprint) {
//     this.security.behavioralFlags.suspiciousDeviceChange = true;
//   }
// };

// Instance Methods
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;

  return bcrypt.compare(candidatePassword, this.password);
};
UserSchema.methods.isPreviousPassword = async function (
  candidatePassword: string
): Promise<boolean> {
  // Compare against all hashed versions in history
  for (const oldPassword of this.security.previousPasswords) {
    if (await bcrypt.compare(candidatePassword, oldPassword)) {
      return true;
    }
  }
  return false;
};
UserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.verification.verificationToken = hashedToken;
  this.verification.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

UserSchema.methods.generateTwoFactorSecret = function (): void {
  const secret = crypto.randomBytes(32).toString("base64");
  this.security.twoFactorSecret = secret;
  this.security.twoFactorEnabled = true;
};

UserSchema.methods.isAccountLocked = function (
  action: "login" | "passwordReset" | "verification"
): boolean {
  return !!(
    this.security.rateLimits[action]?.lockUntil &&
    this.security.rateLimits[action]?.lockUntil > new Date()
  );
};

// Virtuals
UserSchema.virtual("fullName").get(function () {
  return this.name.trim();
});
// Add other methods as in your original schema...

const UserModel: Model<IUser> = models.User || model<IUser>("User", UserSchema);

export default UserModel;
