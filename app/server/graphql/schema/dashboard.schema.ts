/* dashboard.schema.ts */
export const dashboardTypeDefs = /* GraphQL */ `
  type Query {
    getDashboardData: DashboardData!
  }

  type DashboardData {
    users: UserAnalytics!
    orders: OrderAnalytics!
    products: ProductAnalytics!
    refunds: RefundAnalytics!
    reports: ReportAnalytics!
    userInterestProducts: UserInterestProducts!
  }

  type UserAnalytics {
    totalUsers: Int!
    activeUsers: Int!
    recentSignups: Int!
    languageDistribution: [LanguageDistribution!]!
    geographicalInsights: GeographicalInsights!
    security: SecurityAnalytics!
    deviceDiversity: DeviceDiversity!
    weeklyGrowth: [UserWeeklyGrowth!]!
  }

  type LanguageDistribution {
    language: String!
    count: Int!
  }

  type GeographicalInsights {
    topLocations: [TopLocation!]!
    deviceDistribution: [DeviceDistribution!]!
    totalCities: Int!
  }

  type TopLocation {
    city: String!
    country: String!
    logins: Int!
    uniqueUsers: Int!
    commonDevices: [String!]!
    commonBrowsers: [String!]!
    coordinates: Coordinates!
    growthPercentage: Float!
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type DeviceDistribution {
    count: Int!
    device: String!
    os: String!
    citiesCoverage: Int!
  }

  type SecurityAnalytics {
    twoFactorAdoption: Int!
    lockedAccounts: Int!
    highRiskUsers: Int!
    authActivity: AuthActivity!
    threats: SecurityThreats!
    rateLimits: RateLimits!
    trends: [SecurityTrend!]!
  }

  type AuthActivity {
    loginsLast24h: Int!
    failedAttempts: Int!
    uniqueLocations: Int!
  }

  type SecurityThreats {
    impossible_travel: Int!
    suspiciousDevices: Int!
    botAttempts: Int!
  }

  type RateLimits {
    activeLockouts: Int!
    passwordResetAttempts: Int!
  }

  type SecurityTrend {
    date: String!
    attempts: Int!
    successRate: String!
  }

  type DeviceDiversity {
    totalDevices: Int!
  }

  type UserWeeklyGrowth {
    label: String!
    currentLogins: Int!
    previousLogins: Int!
    growthPercentage: String!
  }

  type ProductAnalytics {
    inventory: ProductInventory!
    sales: ProductSales!
    discounts: ProductDiscounts!
    engagement: ProductEngagement!
    categories: [ProductCategory!]!
    recentChanges: [ProductChange!]!
    shipping: ProductShipping!
    risk: ProductRisk!
    weeklyGrowth: [ProductWeeklyGrowth!]!
    reservations: ProductReservations!
  }

  type ProductInventory {
    total: Int!
    outOfStock: Int!
    lowStock: Int!
    active: Int!
    totalValue: Float!
    reservedValue: Float!
  }

  type ProductSales {
    totalSold: Int!
    totalRevenue: Float!
    avgSales: Float!
    topSelling: Int!
  }

  type ProductDiscounts {
    active: Int!
    expiringSoon: Int!
    avgDiscount: Float!
  }

  type ProductEngagement {
    avgRating: Float!
    totalReviews: Int!
    recentReviews: Int!
  }

  type ProductCategory {
    name: String!
    count: Int!
    sales: Float!
    avgPrice: Float!
    avgStock: Float!
  }

  type ProductChange {
    slug: String!
    name: String!
    type: String!
    modifiedBy: String!
  }

  type ProductShipping {
    avgWeight: Float!
    totalVolume: Float!
  }

  type ProductRisk {
    stockConflicts: Int!
  }

  type ProductWeeklyGrowth {
    label: String!
    salesGrowth: Float!
    currentSales: Int!
    previousSales: Int!
    currentRevenue: Float!
    revenueGrowth: Float!
    previousRevenue: Float!
  }

  type ProductReservations {
    reservedQuantity: Int!
    reservedValue: Float!
    avgReservationDuration: Float!
    conversionRate: Float!
    abandonmentRate: Float!
  }

  type OrderAnalytics {
    summary: OrderSummary!
    financialHealth: OrderFinancialHealth!
    customerBehavior: OrderCustomerBehavior!
    topProducts: [OrderTopProduct!]!
    trends: OrderTrends!
    fulfillment: OrderFulfillment!
    paymentMethods: [PaymentMethod!]!
    topLocations: [OrderTopLocation!]!
    recentOrders: [RecentOrder!]!
    weeklyGrowth: [OrderWeeklyGrowth!]!
  }

  type OrderSummary {
    totalOrders: Int!
    completedOrders: Int!
    avgOrderValue: Float!
    totalRevenue: Float!
    avgItemsPerOrder: Float!
  }

  type OrderFinancialHealth {
    netRevenue: Float!
    totalTax: Float!
    refundRate: Float!
    weeklyGrowth: Float!
  }

  type OrderCustomerBehavior {
    repeatRate: Float!
    avgLTV: Float!
    topSpender: Float!
  }

  type OrderTopProduct {
    product_id: String!
    name: String!
    unitsSold: Int!
    revenue: Float!
  }

  type OrderTrends {
    monthly: [MonthlyTrend!]!
    yoyGrowth: Float!
    weeklyBreakdown: [WeeklyBreakdown!]!
  }

  type MonthlyTrend {
    period: String!
    orders: Int!
    revenue: Float!
    aov: Float!
  }

  type WeeklyBreakdown {
    week: String!
    current: Int!
    previous: Int!
    growth: Float!
  }

  type OrderFulfillment {
    statusDistribution: [StatusDistribution!]!
    slaCompliance: Float!
  }

  type StatusDistribution {
    status: String!
    count: Int!
    avgHours: Float!
  }

  type PaymentMethod {
    method: String!
    usageCount: Int!
    totalProcessed: Float!
  }

  type OrderTopLocation {
    city: String!
    state: String!
    country: String!
    orderCount: Int!
    revenue: Float!
  }

  type RecentOrder {
    _id: String!
    status: String!
    total: Float!
    created_at: String!
    items: [OrderItem!]!
  }

  type OrderItem {
    name: String!
    price: Float!
    quantity: Int!
  }

  type OrderWeeklyGrowth {
    label: String!
    orderGrowth: Float!
    revenueGrowth: Float!
    currentOrders: Int!
    currentRevenue: Float!
  }

  type ReportAnalytics {
    total: Int!
    resolved: Int!
    resolutionRate: Float!
    avgResolutionTime: Float!
    statusBreakdown: [ReportStatusBreakdown!]!
    trendingIssues: [TrendingIssue!]!
    recentReports: [RecentReport!]!
    dailyTrend: [DailyTrend!]!
    weeklyTrends: [ReportWeeklyTrend!]!
  }

  type ReportStatusBreakdown {
    status: String!
    count: Int!
  }

  type TrendingIssue {
    issue: String!
    count: Int!
    affectedProducts: [String!]!
  }

  type RecentReport {
    _id: String!
    issue: String!
    status: String!
    product: String!
    reporter: String!
    created_at: String!
  }

  type DailyTrend {
    date: String!
    reports: Int!
  }

  type ReportWeeklyTrend {
    label: String!
    resolutionGrowth: String!
    reportGrowth: String!
    currentResolved: Int!
    currentTotal: Int!
  }

  type RefundAnalytics {
    total: Int!
    totalAmount: Float!
    approvalRate: Float!
    avgProcessingTime: Float!
    weeklyTrend: [RefundWeeklyTrendData!]!
    commonReasons: [RefundReason!]!
    recentRefunds: [RecentRefund!]!
    weeklyGrowth: [RefundWeeklyGrowth!]!
    highRiskRefunds: HighRiskRefunds!
    financialImpact: RefundFinancialImpact!
  }

  type RefundWeeklyTrendData {
    week: String!
    data: [RefundTrendDataItem!]!
  }

  type RefundTrendDataItem {
    key: String!
    value: Float!
  }

  type RefundReason {
    reason: String!
    frequency: Int!
    financialImpact: Float!
  }

  type RecentRefund {
    _id: String!
    amount: Float!
    status: String!
    user: String!
    created_at: String!
    invoice_id: String!
  }

  type RefundWeeklyGrowth {
    label: String!
    amountGrowth: String!
    countGrowth: String!
    currentAmount: Float!
    currentCount: Int!
  }

  type HighRiskRefunds {
    count: Int!
  }

  type RefundFinancialImpact {
    totalRefunded: Float!
    avgRefund: Float!
    maxRefund: Float!
  }

  type UserInterestProducts {
    categoryAnalysis: CategoryAnalysis!
    conversionMetrics: [ConversionMetric!]!
    combined: [CombinedProduct!]!
    highInterestProducts: HighInterestProducts!
  }

  type CategoryAnalysis {
    cart: [CartCategory!]!
    wishlist: [WishlistCategory!]!
  }

  type CartCategory {
    category: String!
    totalItems: Int!
    uniqueUsers: Int!
    priceRange: PriceRange!
  }

  type WishlistCategory {
    category: String!
    totalItems: Int!
    uniqueUsers: Int!
    priceSensitivity: Float!
  }

  type PriceRange {
    min: Float!
    max: Float!
    avg: Float!
  }

  type ConversionMetric {
    product_id: String!
    weeks: [WeeklyConversion!]!
  }

  type WeeklyConversion {
    week: Int!
    cartAdds: Int!
    purchases: Int!
    conversionRate: Float!
  }

  type CombinedProduct {
    slug: String!
    name: String!
    category: String!
    cartCount: Int!
    wishlistCount: Int!
    interestScore: Float!
  }

  type HighInterestProducts {
    frequentlyCartAdded: [FrequentProduct!]!
    frequentlyWishlisted: [FrequentProduct!]!
    abandonedItems: [AbandonedItem!]!
  }

  type FrequentProduct {
    slug: String!
    count: Int!
    name: String!
    category: String!
    price: Float!
  }

  type AbandonedItem {
    slug: String!
    count: Int!
    name: String!
    stock: Int!
  }
`;
