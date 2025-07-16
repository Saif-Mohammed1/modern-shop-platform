export const cartTypeDefs = /* GraphQL */ `
  type CartItems {
    _id: String
    name: String
    price: Float
    images: [ProductImage]
    stock: Int
    slug: String
    category: String
    discount: Float
    discount_expire: DateTime
    quantity: Int
  }

  type Cart {
    products: [CartItems]!
  }
  input localCartDto {
    product_id: String!
    quantity: Int!
  }
  type Query {
    getMyCart: Cart!
  }
  type Mutation {
    addToCart(product_id: String!, quantity: Int): responseWithMessage!
    decreaseQuantity(product_id: String!): responseWithMessage!
    removeProductFromCart(product_id: String!): responseWithMessage!
    clearCart: responseWithMessage!
    saveLocalCartToDB(localCart: [localCartDto]!): responseWithMessage!
  }
`;
