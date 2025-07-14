export const shopTypeDefs = /* GraphQL */ `
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

  type ProductsResult {
    docs: [Product!]!
    meta: PaginationMeta!
    links: Links
  }

  type Product {
    _id: String
    name: String
    category: String
    price: Float
    discount: Float
    discount_expire: DateTime
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
    name: String
    category: String
    price: Float
    discount: Float
    discount_expire: DateTime
    description: String
    stock: Int
    slug: String
    reserved: Int
    sold: Int
    sku: String
    images: [ProductImageInput]
    shipping_info: ProductShippingInput
  }

  input ProductImageInput {
    _id: String
    link: String
    public_id: String
  }

  input ProductShippingInput {
    weight: Float
    dimensions: ProductDimensionsInput
  }

  input ProductDimensionsInput {
    length: Float
    width: Float
    height: Float
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
  type Query {
    getProducts(filter: SearchParams): ProductsWithCategories
    getProductBySlug(slug: String!, populate: Boolean): ProductWithDistribution
    getTopOffersAndNewProducts: Product
  }
  type Mutation {
    createProduct(product: ProductInput!): Product
    updateProduct(_id: String!, product: ProductInput!): Product
    deleteProduct(_id: String!): Product
  }
`;
