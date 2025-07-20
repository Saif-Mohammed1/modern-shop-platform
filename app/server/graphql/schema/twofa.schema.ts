export const twoFATypeDefs = /* GraphQL */ `
  type TwoFALoginType {
    requires2FA: Boolean!
    tempToken: String!
    expires: String!
    message: String
  }

  type TwoFactorSetupResult {
    qrCode: String!
    manualEntryCode: String!
    backupCodes: [String!]!
  }

  type TwoFactorAuditLog {
    timestamp: DateTime!
    action: String!
    metadata: String!
  }

  type TwoFactorRecoveryResult {
    newCodes: [String!]!
  }

  type TwoFactorStatus {
    enabled: Boolean!
    backupCodesCount: Int!
    lastUsed: DateTime
  }

  input Verify2FAInput {
    token: String!
    tempToken: String
  }

  input Disable2FAInput {
    code: String!
  }

  input VerifyBackupCodeInput {
    code: String!
  }

  input ValidateBackupCodesInput {
    codes: [String!]!
    email: String!
  }

  type Query {
    getTwoFactorStatus: TwoFactorStatus!
    getTwoFactorAuditLogs: [TwoFactorAuditLog!]!
  }

  type Mutation {
    # Two-Factor Authentication mutations
    enable2FA: TwoFactorSetupResult!
    verify2FA(input: Verify2FAInput!): responseWithMessage!
    disable2FA(input: Disable2FAInput!): responseWithMessage!
    regenerateBackupCodes: TwoFactorRecoveryResult!
    verifyBackupCode(input: VerifyBackupCodeInput!): responseWithMessage!
    validateBackupCodes(input: ValidateBackupCodesInput!): UserResult!
    verify2FALogin(token: String!, tempToken: String!): UserResult!
  }
`;
