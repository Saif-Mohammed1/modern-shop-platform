export const authTypeDefs = /* GraphQL */ `
  scalar DateTime
  scalar EmailAddress

  type Sessions{
  _id: String
  user_id: String
  device_id: String
  hashed_token: String
  is_active: Boolean;
  revoked_at: DateTime
  expires_at: DateTime
  last_used_at: DateTime
  created_at: DateTime
  updated_at: DateTime
  }
  
  type PaginationMeta {
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type Links {
    first: String
    prev: String
    next: String
    last: String
  }

  type ProductsResult {
    docs: [Product!]!
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
    created_at: String!
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
  type responseWithMessage {
    message: String!
  }

  input resetPasswordInput {
    email: String!
    token: String!
    password: String!
    confirmPassword: String!
  }
  type Query {
    getUser: UserAuthType!
    getUserById(id: ID!): UserAuthType!
    getActiveSessions: ProductsResult!

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
