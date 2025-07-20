export const refundTypeDefs = /* GraphQL */ `
  type Refund {
    _id: ID!
    invoice_id: String!
    user_id: String!
    reason: String!
    status: RefundStatus!
    amount: Float!
    created_at: DateTime!
    updated_at: DateTime!
    processed_by: String
    processed_at: DateTime
    notes: String
    user: User
  }

  enum RefundStatus {
    PENDING
    APPROVED
    REJECTED
    PROCESSED
  }

  type RefundsResult {
    docs: [Refund!]!
    meta: PaginationMeta!
    links: Links
  }

  input CreateRefundInput {
    invoice_id: String!
    reason: String!
    amount: Float!
  }

  input UpdateRefundStatusInput {
    status: RefundStatus!
    notes: String
  }

  extend type Query {
    getRefunds(page: Int, limit: Int, status: RefundStatus): RefundsResult!
    getRefundById(id: ID!): Refund
    getUserRefunds: RefundsResult!
  }

  extend type Mutation {
    createRefundRequest(input: CreateRefundInput!): Refund!
    updateRefundStatus(id: ID!, input: UpdateRefundStatusInput!): Refund!
    deleteRefund(id: ID!): responseWithMessage!
  }
`;
