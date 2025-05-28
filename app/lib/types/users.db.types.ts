import type { SecurityAuditAction } from "./audit.db.types";
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
//["en", "es", "fr", "de", "uk"],
export enum Preferences {
  En = "en",
  Es = "es",
  Fr = "fr",
  De = "de",
  Uk = "uk",
}
export enum UserRole {
  CUSTOMER = "customer",
  ADMIN = "admin",
  MODERATOR = "moderator",
}
//  enum: ["USD", "EUR", "GBP", "UAH"],
export enum UserCurrency {
  USD = "USD",
  ERU = "ERU",
  GBP = "GBP",
  UAH = "UAH",
}
export type accountAction =
  | "login"
  | "passwordReset"
  | "verification"
  | "2fa"
  | "backup_recovery";

export interface IUserDB {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  preferences_language: Preferences;
  preferences_currency: UserCurrency;
  preferences_marketingOptIn: boolean;
  login_notification_sent: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  created_at: Date;
  updated_at: Date;
  two_factor_enabled: boolean;
  last_login: Date;
  password_changed_at: Date | null;
}
export interface ISecurityDB {
  user_id: string;
  two_factor_secret: string | null;
  two_factor_secret_expiry: Date | null;
  suspicious_device_change: boolean;
  impossible_travel: boolean;
  request_velocity: number;
  // last_login: Date | null;
  // password_changed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
export interface IRateLimitsDB {
  _id: string;
  user_id: string;
  action: accountAction;
  attempts: number;
  last_attempt: Date | null;
  lock_until: Date | null;
  created_at: Date;
  updated_at: Date;
}
export interface ILoginHistoryDB {
  _id: string; // UUID
  user_id: string; // UUID
  device_id: string; // UUID
  success: boolean;
  created_at: Date;
}
export interface IDeviceFingerprintDB {
  _id: string; // UUID
  user_id: string; // UUID
  is_bot: boolean;
  source: "audit_log" | "login_history" | "user_sessions";
  ip: string;
  location_city: string;
  location_country: string;
  location_latitude: number;
  location_longitude: number;
  location_source: "ip" | "gps" | "user";
  fingerprint: string;
  created_at: Date;
  updated_at: Date;
}
export interface ILoginHistoryWithDeviceDB
  extends Omit<ILoginHistoryDB, "device_id"> {
  device: IDeviceFingerprintDB;
  device_id: string;
}
export interface IDeviceDetailsDB {
  fingerprint: string;
  os: string;
  browser: string;
  device: string;
  brand: string | null;
  model: string | null;
  created_at: Date;
  updated_at: Date;
}
export interface ISessionDB {
  _id: string;
  user_id: string; // Reference to the User UUID
  device_id: string; // Reference to the Device UUID
  hashed_token: string;
  is_active: boolean; // Track if session is valid or revoked
  revoked_at?: Date;
  expires_at: Date; // Set session expiration date
  last_used_at: Date;
  created_at: Date; // Timestamp
  updated_at: Date; // Timestamp
}
export interface IVerificationDB {
  user_id: string;
  email_change_token: string | null;
  verification_token: string | null;
  email_change: string | null;
  email_change_expires: Date | null;
  verification_expires: Date | null;
}
export interface IAuditLogDB {
  _id: string;
  user_id: string;
  timestamp: Date;
  action: SecurityAuditAction;
  details_success: boolean;
  details_message: string | null;
  device_id: string;
}
export interface IPreviousPasswordsDB {
  _id: string; // UUID
  user_id: string; // UUID
  password: string; // Password hash
  created_at: Date; // Timestamp
  updated_at: Date; // Timestamp
}

export interface IUserJson
  extends Omit<
    IUserDB,
    "last_login" | "password_changed_at" | "updated_at" | "password"
  > {
  last_login?: Date | string | null;
  password_changed_at?: Date | string | null;
  updated_at?: Date | string;
  password?: string;
}

// export type UserAuthType = {
//   _id: Types.ObjectId | string;
//   name: string;
//   email: string;
//   emailVerify: boolean;
//   role: string;
//   created_at: Date;
//   phone?: string;
//   active?: boolean;
//   two_factor_enabled: boolean;
//   access_token?: string;
//   access_token_expires?: number;
// };
export interface UserAuthType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  verification: {
    email_verified: boolean;
    phone_verified: boolean;
  };
  two_factor_enabled: boolean;
  login_notification_sent: boolean;
  status: UserStatus;
  // authMethods: string[];
  access_token?: string;
  access_token_expires?: number;
}
export const allowedRoles: string[] = [UserRole.ADMIN, UserRole.MODERATOR];
