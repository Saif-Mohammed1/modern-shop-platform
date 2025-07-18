export const reviewsTypeDefs = /* GraphQL */ `
  type Review {
    _id: String!
    user_id: String!
    product_id: [Product_id!]!
    rating: Float!
    comment: String!
    created_at: DateTime!
  }
  type Product_id {
    name: String!
    slug: String!
  }
  input CreateReviewInput {
    product_id: String!
    rating: Float!
    comment: String!
  }
  input UpdateReviewInput {
    rating: Float
    comment: String
  }
  type reviewsResult {
    docs: [Review!]!
    meta: PaginationMeta!
    links: Links
  }
  type CheckReviewResult {
    exists: Boolean!
  }
  input Filter {
    page: Int
    limit: Int
  }
  type Query {
    getProductReviews(product_id: String!, filter: Filter): reviewsResult!
    getRatingDistributionByProductId(product_id: String!): RatingDistribution!
    getMyReviews(filter: Filter): reviewsResult!
    checkReview(product_id: String!): CheckReviewResult!
  }
  type Mutation {
    createReview(input: CreateReviewInput!): Review!
    updateReview(id: String!, input: UpdateReviewInput!): Review!
    deleteReview(id: String!): responseWithMessage!
  }
`;
