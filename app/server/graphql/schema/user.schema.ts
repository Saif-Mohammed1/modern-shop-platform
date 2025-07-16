export const userTypeDefs = /* GraphQL */ `
  type UsersResult {
    docs: [User!]!
    meta: PaginationMeta!
    links: Links
  }
  type Query {
    getAllUsers: UsersResult!
  }
  input NewPassword {
    newPassword: String!
    confirmPassword: String!
    currentPassword: String!
  }
  type Mutation {
    deactivateAccount: responseWithMessage!
    deleteAccountByAdmin(id: ID!): responseWithMessage!
    updatePassword(input: NewPassword!): responseWithMessage!
  }
`;
