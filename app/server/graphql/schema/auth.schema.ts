export const authTypeDefs = /* GraphQL */ `
  scalar EmailAddress
  type GeoLocation {
    city: String
    country: String
    latitude: Float
    longitude: Float
    source: String
  }
  type DeviceInfo {
    os: String
    browser: String
    device: String
    brand: String
    model: String
    is_bot: Boolean
    ip: String
    location: GeoLocation
    fingerprint: String
  }
  type Sessions {
    _id: String
    user_id: String
    device_id: String
    device_info: DeviceInfo
    hashed_token: String
    is_active: Boolean
    revoked_at: DateTime
    expires_at: DateTime
    last_used_at: DateTime
    created_at: DateTime
    updated_at: DateTime
  }

  type SessionsResult {
    docs: [Sessions!]!
    meta: PaginationMeta!
    links: Links
  }
  type User {
    _id: ID!
    name: String!
    email: EmailAddress!
    phone: String
    role: String!
    created_at: DateTime!
    verification: VerificationStatus!
    two_factor_enabled: Boolean!
    login_notification_sent: Boolean!
    status: UserStatus!
    access_token: String
    access_token_expires: Int
  }

  type VerificationStatus {
    email_verified: Boolean
    phone_verified: Boolean
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
  }

  type UserAuthType {
    _id: ID!
    name: String!
    email: EmailAddress!
    phone: String!
    role: String!
    created_at: DateTime!
    verification: VerificationStatus!
    two_factor_enabled: Boolean!
    login_notification_sent: Boolean!
    status: UserStatus!
    access_token: String!
    access_token_expires: Int!
  }
  type UserResult {
    user: UserAuthType
    access_token: String
    refreshToken: String
  }
  type TwoFALoginType {
    requires2FA: Boolean!
    tempToken: String!
    expires: String!
    message: String
  }
  input CreateUser {
    name: String!
    email: EmailAddress!
    password: String!
    confirmPassword: String!
    phone: String
    preferences: UserPreferencesInput
  }
  input UserPreferencesInput {
    language: String
    currency: String
    marketingOptIn: Boolean
  }
  union LoginResponse = UserResult | TwoFALoginType

  input resetPasswordInput {
    email: String!
    token: String!
    password: String!
    confirmPassword: String!
  }
  type Query {
    getUser: UserAuthType!
    getUserById(id: ID!): UserAuthType!
    getActiveSessions: SessionsResult!
  }
  type Mutation {
    registerUser(input: CreateUser!): UserResult!
    loginUser(email: EmailAddress!, password: String!): LoginResponse!
    logoutUser: responseWithMessage!
    forgotPassword(email: EmailAddress!): responseWithMessage!
    isEmailAndTokenValid(
      email: EmailAddress!
      token: String!
    ): responseWithMessage!
    resetPassword(input: resetPasswordInput!): responseWithMessage!
    requestEmailChange(email: EmailAddress!): responseWithMessage!
    confirmEmailChange(token: String!): responseWithMessage!
    verifyEmail(code: String!): responseWithMessage!
    sendNewVerificationCode: responseWithMessage!
    updateName(name: String!): responseWithMessage!
    updateLoginNotificationSent(
      login_notification_sent: Boolean!
    ): responseWithMessage!
  }
`;
// updateUser(input: UpdateUserInput!): UserAuthType
