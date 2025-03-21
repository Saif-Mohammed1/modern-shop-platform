// auth.types.ts
export enum RefreshTokenStatus {
  Active = "active",
  Revoked = "revoked",
  Rotated = "rotated",
}
export interface GeoLocation {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  source: "ip" | "gps" | "user";
}
export type DeviceInfo = {
  os: string;
  browser: string;
  device: string;
  brand?: string;
  model?: string;
  isBot: boolean;
  ip: string;
  location: GeoLocation;
  fingerprint: string;
};
export interface sessionInfo {
  _id: string;
  userId: string; // Reference to the User Model
  deviceInfo: DeviceInfo;
  hashedToken: string;
  isActive: boolean; // Track if session is valid or revoked
  revokedAt?: Date;
  expiresAt: Date; // Set session expiration date
  lastUsedAt: Date;
}
// old db.types.ts
// export type sessionInfo = {
//   _id: string;
//   tokenHash: string;
//   user: string;
//   deviceInfo: DeviceInfo;
//   status: RefreshTokenStatus;
//   expiresAt: Date;
//   lastUsedAt: Date;
//   createdAt: Date;
//   updatedAt: Date;
// };
