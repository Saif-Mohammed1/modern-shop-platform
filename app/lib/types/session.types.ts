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
  is_bot: boolean;
  ip: string;
  location: GeoLocation;
  fingerprint: string;
};
export interface sessionInfo {
  _id: string;
  user_id: string; // Reference to the User Model
  device_info: DeviceInfo;
  hashed_token: string;
  is_active: boolean; // Track if session is valid or revoked
  revoked_at?: Date;
  expires_at: Date; // Set session expiration date
  last_used_at: Date;
}
// old db.types.ts
// export type sessionInfo = {
//   _id: string;
//   tokenHash: string;
//   user: string;
//   device_info: DeviceInfo;
//   status: RefreshTokenStatus;
//   expires_at: Date;
//   last_used_at: Date;
//   created_at: Date;
//   updated_at: Date;
// };
