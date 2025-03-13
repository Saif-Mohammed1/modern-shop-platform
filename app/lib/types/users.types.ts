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
  UAH = "USD",
}
export type accountAction =
  | "login"
  | "passwordReset"
  | "verification"
  | "2fa"
  | "backup_recovery";

// export type UserAuthType = {
//   _id: Types.ObjectId | string;
//   name: string;
//   email: string;
//   emailVerify: boolean;
//   role: string;
//   createdAt: Date;
//   phone?: string;
//   active?: boolean;
//   twoFactorEnabled: boolean;
//   accessToken?: string;
//   accessTokenExpires?: number;
// };
export interface UserAuthType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: string;
  verification: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  twoFactorEnabled: boolean;
  loginNotificationSent: boolean;
  status: UserStatus;
  authMethods: string[];
  accessToken?: string;
  accessTokenExpires?: number;
}
