export const userTypeDefs = /* GraphQL */ `
  enum UserStatus {
    active
    inactive
    suspended
    deleted
  }

  type UserPreferences {
    language: String
    currency: String
  }

  type RateLimit {
    locked: Boolean!
    last_attempt: String
    attempts: Int!
    lock_until: String
  }

  type RateLimits {
    login: RateLimit!
    passwordReset: RateLimit!
    verification: RateLimit!
    _2fa: RateLimit!
    backup_recovery: RateLimit!
  }

  type BehavioralFlags {
    suspicious_device_change: Boolean!
    impossible_travel: Boolean!
    request_velocity: Int!
  }

  type UserDeviceInfo {
    fingerprint: String
    device: String
    os: String
    browser: String
    brand: String
    model: String
    ip: String
    location: LocationInfo
    is_bot: Boolean
  }

  type LocationInfo {
    city: String
    country: String
    latitude: Float
    longitude: Float
    source: String
  }

  type AuditLogEntry {
    _id: ID!
    timestamp: String!
    action: String!
    details: AuditLogDetails!
  }

  type AuditLogDetails {
    success: Boolean!
    message: String!
    device: UserDeviceInfo
  }

  type LoginHistoryEntry {
    _id: ID!
    timestamp: String!
    success: Boolean!
    device: UserDeviceInfo
  }

  type UserSecurity {
    two_factor_enabled: Boolean!
    rateLimits: RateLimits!
    behavioralFlags: BehavioralFlags!
    auditLog: [AuditLogEntry!]!
    loginHistory: [LoginHistoryEntry!]!
    last_login: String
    password_changed_at: String
  }

  type UserWithSecurity {
    _id: ID!
    name: String!
    email: EmailAddress!
    phone: String
    role: String!
    status: UserStatus!
    preferences: UserPreferences!
    verification: VerificationStatus!
    login_notification_sent: Boolean!
    two_factor_enabled: Boolean!
    last_login: String
    password_changed_at: String
    created_at: String!
    updated_at: String!
    security: UserSecurity!
    authMethods: [String!]!
  }

  type UserAuthType {
    _id: ID!
    name: String!
    email: EmailAddress!
    phone: String
    role: String!
    status: UserStatus!
    created_at: DateTime!
    verification: VerificationStatus!
    two_factor_enabled: Boolean!
    login_notification_sent: Boolean!
    last_login: DateTime!
  }

  type ClientAuditLogDetails {
    action: String!
    timestamp: DateTime!
    details: AuditLogDetails!
  }

  type UserWithAuditLog {
    _id: ID!
    name: String!
    email: EmailAddress!
    phone: String
    role: String!
    status: UserStatus!
    created_at: String!
    verification: VerificationStatus!
    two_factor_enabled: Boolean!
    login_notification_sent: Boolean!
    security: UserSecurityAuditLog!
  }

  type UserSecurityAuditLog {
    auditLog: [ClientAuditLogDetails!]!
  }

  type UserPaginate {
    docs: [UserAuthType!]!
    meta: PaginationMeta!
    links: Links
  }

  input UserFilterInput {
    search: String
    status: String
    sort: String
    role: String
    page: Int
    limit: Int
  }

  type Query {
    getAllUsers(filter: UserFilterInput): UserPaginate!
    getUserById(id: ID!): UserWithSecurity!
    findUserWithAuditLogById(id: ID!): UserWithAuditLog!
  }

  input NewPassword {
    newPassword: String!
    confirmPassword: String!
    currentPassword: String!
  }

  input UpdateUserByAdminInput {
    name: String
    email: String
    role: String
    status: String
  }

  input CreateUserByAdminInput {
    name: String!
    email: String!
    password: String!
    phone: String
    role: String!
    status: String!
    authMethods: [String!]!
    preferences: UserPreferencesAdminInput!
  }

  input UserPreferencesAdminInput {
    language: String!
    currency: String!
    marketingOptIn: Boolean!
  }

  type Mutation {
    deactivateAccount: responseWithMessage!
    deleteAccountByAdmin(id: ID!): responseWithMessage!
    updatePassword(input: NewPassword!): responseWithMessage!
    updateUserByAdmin(
      id: ID!
      input: UpdateUserByAdminInput!
    ): UserWithAuditLog!
    createUserByAdmin(input: CreateUserByAdminInput!): UserWithAuditLog!
    forcePasswordReset(id: ID!): responseWithMessage!
    revokeSessions(id: ID!): responseWithMessage!
    lockAccount(id: ID!): responseWithMessage!
    unlockAccount(id: ID!): responseWithMessage!
    deleteUserByAdmin(id: ID!): responseWithMessage!
  }
`;
