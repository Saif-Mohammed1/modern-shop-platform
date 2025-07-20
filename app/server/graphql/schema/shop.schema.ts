export const shopTypeDefs = /* GraphQL */ `
  type ProductsResult {
    docs: [ProductBase!]!
    meta: PaginationMeta!
    links: Links
  }

  type ProductBase {
    _id: String
    name: String
    category: String
    price: Float
    discount: Float
    discount_expire: String
    description: String
    stock: Int
    ratings_average: Float
    ratings_quantity: Int
    slug: String
    reserved: Int
    sold: Int
    sku: String
    created_at: String
    images: [ProductImage]
    shipping_info: ProductShipping
  }

  type Product {
    _id: String
    name: String
    category: String
    price: Float
    discount: Float
    discount_expire: String
    description: String
    stock: Int
    ratings_average: Float
    ratings_quantity: Int
    slug: String
    reserved: Int
    sold: Int
    sku: String
    created_at: String
    images: [ProductImage]
    shipping_info: ProductShipping
    reviews: [ProductReview]
  }

  type ProductImage {
    _id: String
    link: String
    public_id: String
  }

  type ProductShipping {
    weight: Float
    dimensions: ProductDimensions
  }

  type ProductDimensions {
    length: Float
    width: Float
    height: Float
  }

  type ProductReview {
    _id: String
    user_name: String
    rating: Float
    comment: String
    created_at: String
  }
  input ProductInput {
    name: String!
    category: String!
    price: Float!
    discount: Float
    discount_expire: String
    description: String!
    stock: Int!
    sku: String
    images: [String!]!
    shipping_info: ProductShippingInput!
    reserved: Int
    sold: Int
  }

  input ProductShippingInput {
    weight: Float!
    dimensions: ProductDimensionsInput!
  }

  input ProductDimensionsInput {
    length: Float!
    width: Float!
    height: Float!
  }
  type RatingDistribution {
    one: Int
    two: Int
    three: Int
    four: Int
    five: Int
  }

  type ProductWithDistribution {
    product: Product
    distribution: RatingDistribution
  }
  type ProductsWithCategories {
    products: ProductsResult!
    categories: [String!]!
  }
  input SearchParams {
    category: String
    name: String
    search: String
    sort: String
    fields: String
    page: Int
    limit: Int
    rating: Float
  }

  input ProductHistoryFilterInput {
    sort: String
    page: Int
    limit: Int
    actor: String
    action: String
  }

  type ProductHistoryItem {
    versionId: String!
    timestamp: String!
    name: String
    price: Float
    discount: Float
    stock: Int
    description: String
  }

  type ProductHistoryResult {
    docs: [ProductHistoryItem!]!
    meta: PaginationMeta!
    links: Links
  }

  type TopOfferProducts {
    topOfferProducts: [ProductBase!]
    newProducts: [ProductBase!]
    topRating: [ProductBase!]
  }
  type Query {
    getProducts(filter: SearchParams): ProductsWithCategories
    getProductBySlug(slug: String!, populate: Boolean): ProductWithDistribution
    getTopOffersAndNewProducts: TopOfferProducts!
    getProductHistory(
      slug: String!
      productHistoryFilter: ProductHistoryFilterInput
    ): ProductHistoryResult!
  }
  type Mutation {
    createProduct(product: ProductInput!): Product
    updateProduct(_id: String!, product: ProductInput!): Product
    deleteProduct(_id: String!): Product
    toggleProductStatus(slug: String!): Product
    removeProductImage(slug: String!, public_id: String!): responseWithMessage!
    restoreProductVersion(slug: String!, versionId: String!): Product
  }
`;
