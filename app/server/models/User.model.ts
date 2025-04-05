import crypto from 'crypto';

import bcrypt from 'bcryptjs';
import type {Document, Model, Types} from 'mongoose';
import {Schema, model, models} from 'mongoose';
import validator from 'validator';

import {SecurityAuditAction} from '@/app/lib/types/audit.types';
import type {DeviceInfo, GeoLocation} from '@/app/lib/types/session.types';
import {
  AuthMethod,
  UserCurrency,
  UserRole,
  UserStatus,
  type accountAction,
} from '@/app/lib/types/users.types';
import AppError from '@/app/lib/utilities/appError';
import {obfuscateEmail} from '@/app/lib/utilities/helpers';
import {SecurityAlertType} from '@/app/server/services/email.service';
import {TokensService} from '@/app/server/services/tokens.service';

// import { emailService } from "../services";
interface ILoginHistory extends DeviceInfo {
  timestamp: Date;
  //   ipAddress: string;
  //   userAgent: string;
  success: boolean;
}
interface IAuditLog {
  timestamp: Date;
  action: SecurityAuditAction;
  details: Object;
}
interface IRateLimits {
  'login': {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  'passwordReset': {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  'verification': {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  '2fa': {
    attempts: number;
    lastAttempt: Date;
    lockUntil: Date;
  };
  'backup_recovery': {
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
  emailChangeToken?: string;
  emailChangeExpires?: Date;
  emailChange?: string;
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
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  isPreviousPassword(candidatePassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  generateTwoFactorSecret(): void;
  isAccountLocked(action: accountAction): boolean;
  trackLoginAttempt(ipAddress: string, userAgent: string, success: boolean): void;

  // Statics
  checkRateLimit(action: accountAction): void;
  incrementRateLimit(action: accountAction): Promise<void>;
  detectAnomalies(deviceInfo: DeviceInfo): void;
  anonymizeSecurityData(securityData: any): any;
  filterForRole(requesterRole?: UserRole): object;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      validate: {
        validator: (v: string) => validator.isMobilePhone(v),
        message: 'Please provide a valid phone number',
      },
    },
    password: {
      type: String,
      select: false,
      required: [true, 'Password is required'],
      minlength: [10, 'Password must be at least 10 characters'],
      maxlength: [40, 'Password cannot exceed 40 characters'],
      validate: {
        validator: (v: string) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/.test(v),
        message:
          'Password must contain at least one uppercase, one lowercase, one number, and one special character',
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
        default: 'uk',
        enum: ['en', 'es', 'fr', 'de', 'uk'],
      },
      currency: {
        type: String,
        default: UserCurrency.UAH,
        enum: Object.values(UserCurrency),
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
      twoFactorSecret: {type: String, select: false},
      twoFactorSecretExpiry: Date,
      twoFactorEnabled: {type: Boolean, default: false},
      rateLimits: {
        'login': {
          attempts: {type: Number, default: 0},
          lastAttempt: Date,
          lockUntil: Date,
        },
        'passwordReset': {
          attempts: {type: Number, default: 0},
          lastAttempt: Date,
          lockUntil: Date,
        },
        'verification': {
          attempts: {type: Number, default: 0},
          lastAttempt: Date,
          lockUntil: Date,
        },
        '2fa': {
          attempts: {type: Number, default: 0},
          lastAttempt: Date,
          lockUntil: Date,
        },
        'backup_recovery': {
          attempts: {type: Number, default: 0},
          lastAttempt: Date,
          lockUntil: Date,
        },
      },
      behavioralFlags: {
        suspiciousDeviceChange: {type: Boolean, default: false},
        impossibleTravel: {type: Boolean, default: false},
        requestVelocity: {type: Number, default: 0},
      },
      lastLogin: Date,
      auditLog: [
        {
          timestamp: {type: Date, default: Date.now},

          action: {
            type: String,
            enum: Object.values(SecurityAuditAction),
            required: true,
          },
          details: {type: Object, required: true},

          _id: false,
        },
      ],
      loginHistory: [
        {
          os: {type: String, required: true},
          browser: {type: String, required: true},
          device: {type: String, required: true},
          brand: {type: String},
          model: {type: String},
          isBot: {type: Boolean, required: true},
          ip: {type: String, required: true},
          location: {
            city: {type: String, required: true},
            country: {type: String, required: true},
            latitude: {type: Number, required: true},
            longitude: {type: Number, required: true},
            source: {type: String, required: true},
          },
          fingerprint: {type: String, required: true},
          timestamp: {type: Date, default: Date.now},
          success: {type: Boolean, required: true},
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
      emailChangeToken: String,
      emailChangeExpires: Date,
      emailChange: String,
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
      transform: function (_, ret) {
        // Remove universally sensitive fields for all roles
        delete ret.verification?.emailChangeExpires;
        delete ret.verification?.verificationExpires;
        delete ret.verification?.emailChangeToken;
        delete ret.verification?.verificationToken;
        delete ret.password;
        delete ret.__v;
        delete ret.security?.twoFactorSecret;
        delete ret.security?.previousPasswords;
        delete ret.verification?.emailChangeToken;
        delete ret.verification?.verificationToken;

        ['createdAt', 'updatedAt'].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split('T')[0];
          }
        });
        return ret;
      },
    },
  },
);

// Plugins
// UserSchema.plugin(auditPlugin);

// Indexes
UserSchema.index({email: 1}, {unique: true, collation: {locale: 'en', strength: 2}}); // Add this during collection setup
UserSchema.index({'security.auditLog.timestamp': 1});
UserSchema.index({'security.lastLogin': -1});
UserSchema.index({'security.loginHistory.ip': 1});
UserSchema.index({'security.loginHistory.fingerprint': 1});
UserSchema.index({'verification.emailVerified': 1});
UserSchema.index({
  'security.rateLimits.login.lockUntil': 1,
  'security.rateLimits.passwordReset.lockUntil': 1,
  'security.rateLimits.verification.lockUntil': 1,
  'security.rateLimits.2fa.lockUntil': 1,
  'security.rateLimits.backup_recovery.lockUntil': 1,
});

UserSchema.index({
  'security.behavioralFlags.suspiciousDeviceChange': 1,
  'security.behavioralFlags.impossibleTravel': 1,
});
UserSchema.index({'security.loginHistory.location.city': 1});
UserSchema.index({'security.loginHistory.location.country': 1});
UserSchema.index({'security.loginHistory.timestamp': 1});
// Middleware

UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password')) {
    try {
      if (!this.isNew) {
        // Fetch the existing document to get the old hashed password
        const existingUser = await (this.constructor as Model<IUser>)
          .findById(this.id)
          .select('+password');
        if (existingUser) {
          // Push the old hashed password into the history
          this.security.previousPasswords.push(existingUser.password);
          // Keep only last 5 passwords
          if (this.security.previousPasswords.length > 5) {
            this.security.previousPasswords.shift();
          }
        }
      }

      // Hash the new password
      this.password = await bcrypt.hash(this.password, 12);

      // Set password change timestamp
      this.security.passwordChangedAt = this.isNew ? undefined : new Date(Date.now() - 1000);
    } catch (error) {
      return next(error as Error);
    }
  }

  if (this.isModified('email')) {
    this.verification.emailVerified = false;
  }

  next();
});

// enhancement for
UserSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('security.rateLimits')) {
    const loginLimits = this.security.rateLimits.login;

    // 1. Calculate request velocity (failed attempts only)
    this.security.behavioralFlags.requestVelocity = this.security.loginHistory.filter(
      (entry) => !entry.success && Date.now() - entry.timestamp.getTime() < 3600000,
    ).length;

    // 2. Automatic lockout escalation
    if (loginLimits.attempts >= 5 || this.security.behavioralFlags.requestVelocity > 10) {
      loginLimits.lockUntil = new Date(Date.now() + 24 * 3600000); // 24h lock
      this.security.auditLog.push({
        timestamp: new Date(),
        action: SecurityAuditAction.ACCOUNT_LOCKED,
        details: `Automatic lockdown due to ${loginLimits.attempts} failed attempts`,
      });
    }

    // 3. Suspicious activity notifications
    if (this.security.behavioralFlags.requestVelocity > 5) {
      const {emailService} = await import('../services');

      await emailService.sendSecurityAlertEmail(this.email, {
        type: SecurityAlertType.SUSPICIOUS_ACTIVITY,
        // type: "SUSPICIOUS_ACTIVITY",
        additionalInfo: {
          attempts: loginLimits.attempts,
        },
        location: this.security.loginHistory
          .map((entry) => `${entry.location.city}, ${entry.location.country}`)
          .filter((location) => location)
          .join('; '), // Combine locations into a single string
      });
    }
  }
  next();
});

UserSchema.methods.anonymizeSecurityData = function (securityData: any) {
  const tokensService = new TokensService();

  return {
    ...securityData,
    loginHistory:
      securityData.loginHistory?.map((entry: any) => ({
        ...entry,
        timestamp: entry?.timestamp.toISOString().split('T')[0],
        ip: tokensService.hashIpAddress(entry.ip),
        fingerprint: tokensService.hashFingerprint(entry.fingerprint),
      })) || [],

    auditLog:
      securityData.auditLog?.map((entry: any) => ({
        ...entry,
        timestamp: entry?.timestamp.toISOString().split('T')[0],

        details: {
          ...entry.details,
          device: entry.details.device
            ? {
                ...entry.details.device,
                ip: entry.details.device.ip
                  ? tokensService.hashIpAddress(entry.details.device.ip)
                  : null,
                fingerprint: entry.details.device.fingerprint
                  ? tokensService.hashFingerprint(entry.details.device.fingerprint)
                  : null,
              }
            : null,
        },
      })) || [],

    rateLimits: securityData.rateLimits
      ? Object.fromEntries(
          Object.entries(securityData.rateLimits).map(([key, val]: [string, any]) => [
            key,
            {
              locked: !!val.lockUntil && new Date(val.lockUntil) > new Date(),
              lastAttempt: val.lastAttempt ? val.lastAttempt.toISOString().split('T')[0] : null,
              attempts: val.attempts,
            },
          ]),
        )
      : {},
  };
};

UserSchema.methods.filterForRole = function (
  currentUserRole: UserRole = UserRole.CUSTOMER,
): object {
  const userObject = this.toJSON();
  // Remove universally sensitive fields for all roles
  delete userObject.verification?.emailChangeExpires;
  delete userObject.verification?.verificationExpires;
  delete userObject.verification?.emailChangeToken;
  delete userObject.verification?.verificationToken;
  delete userObject.password;
  delete userObject.__v;
  delete userObject.security?.twoFactorSecret;
  delete userObject.security?.previousPasswords;
  delete userObject.verification?.emailChangeToken;
  delete userObject.verification?.verificationToken;
  userObject.twoFactorEnabled = userObject.security?.twoFactorEnabled || false;

  // Apply role-specific transformations
  if ([UserRole.ADMIN, UserRole.MODERATOR].includes(currentUserRole)) {
    // Add to filterForRole() for admins

    userObject.lastLogin = userObject.lastLogin?.toISOString().split('T')[0]; // Truncate timestamp
    // Anonymize security data for admin view
    if (userObject.security) {
      userObject.security.passwordChangedAt = userObject.security.passwordChangedAt
        ?.toISOString()
        .split('T')[0];
      userObject.security.lastLogin = userObject.security.lastLogin?.toISOString().split('T')[0];

      userObject.security = this.anonymizeSecurityData(userObject.security);
    }
  } else {
    delete userObject.security;
    userObject.email = obfuscateEmail(userObject.email);
    delete userObject.updatedAt;
    delete userObject.verification?.emailChange;
  }

  // userObject.email =
  // currentUserRole === UserRole.ADMIN
  //   ? userObject.email
  //   : obfuscateEmail(userObject.email);
  // Common transformations for all non-admin roles

  if (Object.keys(userObject.socialProfiles).length === 0) {
    delete userObject.socialProfiles;
  }

  return userObject;
};

// Enhanced Methods
UserSchema.methods.checkRateLimit = function (
  action: 'login' | 'passwordReset' | 'verification' | '2fa' | 'backup_recovery',
) {
  const now = new Date();
  const rateLimit = this.security.rateLimits[action];

  // Check if still in lock period
  if (rateLimit.lockUntil && rateLimit.lockUntil > now) {
    const minutesLeft = Math.ceil(
      (rateLimit.lockUntil.getTime() - now.getTime()) / 60000, // ms to minutes
    );
    throw new AppError(`Too many attempts. Try again in ${minutesLeft} minutes`, 429);
  }

  // Reset counter if window expired
  if (rateLimit.lastAttempt && now.getTime() - rateLimit.lastAttempt.getTime() > 15 * 60 * 1000) {
    // 15m window
    rateLimit.attempts = 0;
  }
};

UserSchema.methods.incrementRateLimit = async function (
  action: 'login' | 'passwordReset' | 'verification' | '2fa' | 'backup_recovery',
) {
  const rateLimit = this.security.rateLimits[action];
  rateLimit.attempts = (rateLimit.attempts || 0) + 1;
  rateLimit.lastAttempt = new Date();

  // Lock account if exceeds threshold
  if (rateLimit.attempts >= 5) {
    rateLimit.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30m lock
  }
};

UserSchema.methods.detectAnomalies = async function (deviceInfo: DeviceInfo) {
  const MAX_LOGIN_HISTORY = 5; // Check last 5 logins
  const IMPOSSIBLE_TRAVEL_THRESHOLD = 800; // km/h
  const NEW_DEVICE_GRACE_PERIOD = 7 * 24 * 60 * 60 * 1000; // 1 week

  const recentLogins = this.security.loginHistory
    .filter((login: ILoginHistory) => login.success)
    .slice(-MAX_LOGIN_HISTORY);

  // 1. Impossible Travel Detection
  if (recentLogins.length > 0 && deviceInfo.location) {
    const distances = recentLogins.map((login: ILoginHistory) => {
      return calculateDistance(login.location, deviceInfo.location);
    });

    const minDistance = Math.min(...distances);
    const maxSpeed = minDistance / ((Date.now() - recentLogins[0].timestamp.getTime()) / 3600000);

    if (maxSpeed > IMPOSSIBLE_TRAVEL_THRESHOLD) {
      this.security.behavioralFlags.impossibleTravel = true;
      this.security.auditLog.push({
        timestamp: new Date(),
        action: SecurityAuditAction.IMPOSSIBLE_TRAVEL,
        details: `Detected travel speed of ${Math.round(maxSpeed)}km/h from ${recentLogins[0].location.country}`,
      });
    }
  }

  // 2. Device Fingerprint Analysis
  const knownDevices = new Set(
    this.security.loginHistory
      .filter(
        (login: ILoginHistory) => login.timestamp.getTime() > Date.now() - NEW_DEVICE_GRACE_PERIOD,
      )
      .map((login: ILoginHistory) => login.fingerprint),
  );

  if (!knownDevices.has(deviceInfo.fingerprint)) {
    this.security.behavioralFlags.suspiciousDeviceChange = true;

    // Send security alert only for truly new devices
    if (!this.loginNotificationSent) {
      const {emailService} = await import('../services');

      await emailService.sendSecurityAlertEmail(this.email, {
        type: SecurityAlertType.NEW_DEVICE,
        device: deviceInfo,
        ipAddress: deviceInfo.ip,
        location: `${deviceInfo.location.city}, ${deviceInfo.location.country} 
          ${recentLogins[0]?.location.city}, ${recentLogins[0]?.location.country}`,
      });

      this.loginNotificationSent = true;
      this.security.auditLog.push({
        timestamp: new Date(),
        action: SecurityAuditAction.NEW_DEVICE_ALERT_SENT,
        details: {
          success: true,
          device: deviceInfo,
        },
      });
    }
  }

  // 3. Velocity Analysis
  const recentAttempts = this.security.loginHistory.filter(
    (login: ILoginHistory) =>
      Date.now() - login.timestamp.getTime() < 3600000 && // 1 hour
      !login.success,
  );

  if (recentAttempts.length > 5) {
    this.security.behavioralFlags.requestVelocity = recentAttempts.length;
    this.security.rateLimits.login.lockUntil = new Date(Date.now() + 3600000); // 1 hour
    const {emailService} = await import('../services');

    await emailService.sendSecurityAlertEmail(this.email, {
      type: SecurityAlertType.SUSPICIOUS_ACTIVITY,
      additionalInfo: {
        attempts: recentAttempts.length,
        locations: Array.from(
          new Set(recentAttempts.map((a: ILoginHistory) => a.location.country)),
        ),
      },
    });
  }

  // 4. Bot Detection Escalation
  if (deviceInfo.isBot) {
    this.security.rateLimits.login.attempts += 3; // Penalize bots harder
    this.security.auditLog.push({
      timestamp: new Date(),
      action: SecurityAuditAction.BOT_DETECTED,
      details: {
        success: true,
        device: deviceInfo,
      },
    });
  }
};

// Helper function for distance calculation
function calculateDistance(loc1: GeoLocation, loc2: GeoLocation): number {
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
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;

  return bcrypt.compare(candidatePassword, this.password);
};
UserSchema.methods.isPreviousPassword = async function (
  candidatePassword: string,
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
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  this.verification.verificationToken = hashedToken;
  this.verification.verificationExpires = new Date(Date.now() + 10 * 60 * 1000);

  return resetToken;
};

UserSchema.methods.generateTwoFactorSecret = function (): void {
  const secret = crypto.randomBytes(32).toString('base64');
  this.security.twoFactorSecret = secret;
  this.security.twoFactorEnabled = true;
};

UserSchema.methods.isAccountLocked = function (
  action: 'login' | 'passwordReset' | 'verification' | '2fa' | 'backup_recovery',
): boolean {
  return !!(
    this.security.rateLimits[action]?.lockUntil &&
    this.security.rateLimits[action]?.lockUntil > new Date()
  );
};

const UserModel: Model<IUser> = models.User || model<IUser>('User', UserSchema);

export default UserModel;
