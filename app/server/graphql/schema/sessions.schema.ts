export const sessionsTypeDefs = /* GraphQL */ `
  type validSessions {
    access_token: String!
  }
  type Mutation {
    refreshAccessToken: validSessions!
    revokeAllUserTokens: responseWithMessage!
    revokeSession(id: String!): responseWithMessage!
  }
`;
