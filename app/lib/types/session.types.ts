// auth.types.ts
export enum RefreshTokenStatus {
  Active = "active",
  Revoked = "revoked",
  Rotated = "rotated",
}

export type DeviceInfo = {
  os: string;
  browser: string;
  device: string;
  brand?: string;
  model?: string;
  isBot: boolean;
  ip: string;
  location?: string;
  fingerprint: string;
};
// old db.types.ts
export type sessionInfo = {
  _id: string;
  tokenHash: string;
  user: string;
  deviceInfo: DeviceInfo;
  status: RefreshTokenStatus;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};
