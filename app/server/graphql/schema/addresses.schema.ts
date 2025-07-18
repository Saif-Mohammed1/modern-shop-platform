/* address.schema.ts */

export const addressTypeDefs = /* GraphQL */ `
  type AddressType {
    _id: String
    street: String
    city: String
    state: String
    postal_code: String
    phone: String
    country: String
    user_id: String
    created_at: String
  }

  type AddressTypeResult {
    docs: [AddressType!]!
    meta: PaginationMeta!
    links: Links
  }

  input CreateAddressInput {
    phone: String!

    street: String!

    city: String!

    state: String!

    postal_code: String!

    country: String!
  }
  input UpdateAddressInput {
    phone: String
    user_id: String
    street: String
    city: String
    state: String
    postal_code: String
    country: String
  }
  input Filter {
    page: Int
    limit: Int
  }
  type Query {
    getMyAddress(filter: Filter): AddressTypeResult!
  }
  type Mutation {
    addAddress(input: CreateAddressInput!): AddressType!
    deleteMyAddress(id: String!): responseWithMessage!
    updateMyAddress(id: String!, input: UpdateAddressInput!): AddressType!
  }
`;
