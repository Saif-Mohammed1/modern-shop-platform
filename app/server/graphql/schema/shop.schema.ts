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

  type AISearchResult {
    products: ProductsResult!
    searchIntent: String!
    confidence: Float!
    suggestions: [String!]!
  }

  type IntelligentSearchResponse {
    """
    AI-generated response with insights and recommendations
    """
    response: String!

    """
    Confidence score of the AI response (0-1)
    """
    confidence: Float!

    """
    Timestamp when the search was performed
    """
    timestamp: String!

    """
    Optional: Actual product results if AI found specific matches
    """
    suggestedProducts: [ProductBase]

    """
    Optional: Search insights and analytics
    """
    insights: SearchInsights

    """
    Debug logs showing AI tool calls and parameters (for development)
    """
    debugLogs: String
  }

  type SearchInsights {
    """
    Total products found matching criteria
    """
    totalMatches: Int

    """
    Price analysis of found products
    """
    priceAnalysis: PriceAnalysis

    """
    Category distribution
    """
    categories: [String!]

    """
    Average rating of found products
    """
    averageRating: Float

    """
    Stock level insights
    """
    stockInsights: StockInsights

    """
    Personalized recommendations
    """
    recommendations: [String!]
  }

  type PriceAnalysis {
    min: Float
    max: Float
    average: Float
    median: Float
  }

  type StockInsights {
    lowStock: Int
    mediumStock: Int
    highStock: Int
    outOfStock: Int
  }
  type Query {
    getProducts(filter: SearchParams): ProductsWithCategories
    getProductBySlug(slug: String!, populate: Boolean): ProductWithDistribution
    getTopOffersAndNewProducts: TopOfferProducts!
    getProductHistory(
      slug: String!
      productHistoryFilter: ProductHistoryFilterInput
    ): ProductHistoryResult!
    aiSearchProducts(query: String!): AISearchResult!
    """
    Intelligent AI search that can use tools to analyze and search products
    """
    intelligentSearch(query: String!): IntelligentSearchResponse!
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
