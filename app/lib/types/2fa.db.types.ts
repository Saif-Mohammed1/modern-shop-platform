// Improved 2FA Schema
export interface EncryptedData {
  iv: string;
  salt: string;
  content: string;
  authTag: string;
}
export interface ITwoFactorAuthDB {
  user_id: string;
  encrypted_iv: string;
  encrypted_salt: string;
  encrypted_content: string;
  encrypted_auth_tag: string;

  recovery_attempts: number;
  last_used: Date | null;

  created_at: Date;
  updated_at: Date;
}
export interface IBackupCodesDB {
  _id: string; // UUID as string
  two_factor_auth_id: string; // Foreign key to two_factor_auth table
  code: string; // Backup code
  is_used: boolean; // Indicates if the code has been used
  created_at: Date; // Timestamp for when the code was created
  updated_at: Date; // Timestamp for when the code was last updated
}
export interface ITwoFactorAuthAuditLogDB {
  _id: string;
  two_factor_auth_id: string;
  timestamp: Date;
  action: string;
}
