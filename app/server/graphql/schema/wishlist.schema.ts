export const wishlistTypeDefs = /* GraphQL */ `
  type ProductCartPick {
    _id: String
    name: String
    price: Float
    images: [ProductImage]
    stock: Int
    slug: String
    category: String
    discount: Float
    discount_expire: DateTime
  }
  type Wishlist {
    _id: ID!
    items: [ProductCartPick!]!
  }
  type WishlistResponse {
    success: Boolean!
    message: String!
    added: Boolean
  }
  type ChickWishlistResponse {
    isWishlist: Boolean!
  }
  type Query {
    getMyWishlists: Wishlist!
  }

  type Mutation {
    toggleWishlist(id: String!): WishlistResponse!
    checkWishlist(id: String!): ChickWishlistResponse!
  }
`;
