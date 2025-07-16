export const CommonTypeDefs = /* GraphQL */ `
  scalar DateTime

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
  type responseWithMessage {
    message: String!
  }
`;
