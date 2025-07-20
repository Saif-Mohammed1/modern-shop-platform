interface UserAnalyticsResult {
  SecuritySummary: {
    lockedAccounts: string;
    twoFactorAdoption: string;
    highRiskUsers: string;
  };
  ThreatAnalysis: {
    impossible_travel: string;
    suspiciousDevices: string;
  };
  RateLimitsResult: {
    loginLockouts: string;
    passwordResets: string;
  };
  ActivityTrend: {
    date: string;
    attempts: string;
    failures: string;
  };
  TrafficSource: {
    city: string;
    country: string;
    logins: number;
    uniqueUsers: number;
    commonDevices: string[];
    commonBrowsers: string[];
    coordinates: { lat: number; lng: number };
  };
  DeviceUsage: {
    device: string;
    os: string;
    count: string;
    citiesCoverage: string;
  };

  WeeklyData: {
    year: number;
    week: number;
    logins: number;
  };

  WeeklyGrowthResult: {
    year: number;
    week: number;
    currentLogins: number;
    previousLogins: number;
    growthPercentage: number;
    label: string;
  };

  DemographicResult: {
    language: string;
    count: string;
  };
}
interface ProductAnalyticsResult {
  stockInfo: {
    total: number;
    outOfStock: number;
    lowStock: number;
    active: number;
    totalInventoryValue: number;
    totalReservedValue: number;
  };
  salesMetrics: {
    totalSold: number;
    totalRevenue: number;
    avgSalesPerProduct: number;
    topSelling: number;
  };
  discountAnalysis: {
    activeDiscounts: number;
    expiringSoon: number;
    avgDiscount: number;
  };
  engagementMetrics: {
    avgRating: number;
    totalReviews: number;
    recentlyReviewed: number;
  };
  categoryDistribution: {
    category: string;
    count: number;
    totalSales: number;
    avgPrice: number;
    avgStock: number;
  };
  recentActivity: {
    slug: string;
    name: string;
    type: "New Product" | "Updated Product";

    last_modified_by: string;
  };
  shippingMetrics: {
    avgWeight: number;
    totalVolume: number;
  };
  riskAnalysis: { highRiskProducts: number };
  weeklyGrowth: {
    label: string;
    salesGrowth: number;
    currentSales: number;
    previousSales: number;
    revenueGrowth: number;
    currentRevenue: number;
    previousRevenue: number;
  };
}
interface OrderAnalyticsResult {
  summary: {
    totalOrders: number;
    completedOrders: number;
    avgOrderValue: number;
    totalRevenue: number;
    avgItemsPerOrder: number;
  };
  financials: {
    netRevenue: number;
    totalTax: number;
    // avgProcessingCost: number;
    refunds: number;
  };
  customerInsights: {
    repeatCustomers: number;
    avgLifetimeValue: number;
    topSpender: number;
  };
  productAnalytics: {
    _id: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  };
  timeSeries: {
    // _id: { year: number; month: number };
    year: number;
    month: number;
    count: number;
    revenue: number;
    avgOrderValue: number;
  };
  geographicInsights: {
    city: string;
    state: string;
    country: string;
    orderCount: number;
    totalRevenue: number;
  };
  paymentMethods: {
    method: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  };
  fulfillment: {
    _id: string;
    count: number;
    avgFulfillmentTime: number;
  };
  weeklyComparison: {
    week: string;
    currentWeek: number;
    previousWeek: number;
    growthRate: number;
  };
  recentOrders: {
    _id: string;
    status: string;
    total: number;
    created_at: string;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  }; // Replace with proper type if possible
  // weeklyGrowth: {
  //   label: string;
  //   orderGrowth: number;
  //   revenueGrowth: number;
  //   currentOrders: number;
  //   currentRevenue: number;
  // };
  weeklyGrowth: {
    label: string;
    order_growth: number;
    revenue_growth: number;
    current_orders: number;
    previous_orders: number;
    current_revenue: number;
    previous_revenue: number;
  };
}

interface ReportAnalyticsResult {
  summary: {
    total: number;
    resolved: number;
    avgResolutionHours: number;
  };
  statusDistribution: Array<{ _id: string; count: number }>;
  recentReports: Array<{
    _id: string;
    issue: string;
    status: string;
    product: string;
    reporter: string;
    created_at: Date;
  }>;
  trendAnalysis: Array<{ _id: string; count: number }>;
  commonIssues: Array<{
    _id: string;
    count: number;
    products: string[];
  }>;
  weeklyGrowth: Array<{
    label: string;
    resolutionGrowth: number;
    reportGrowth: number;
    currentResolved: number;
    previousResolved: number;
    currentTotal: number;
    previousTotal: number;
  }>;
}

interface RefundAnalyticsResult {
  summary: {
    total: number;
    totalAmount: number;
    approved: number;
    avgProcessingHours: number;
  };
  statusTrend: Array<{
    week: number;
    status: string;
    count: number;
  }>;
  recentRefunds: Array<{
    _id: string;
    amount: number;
    status: string;
    user: string;
    created_at: Date;
    invoice_id: string;
  }>;
  commonReasons: Array<{
    reason: string;
    count: number;
    totalAmount: number;
  }>;
  highRiskRefunds: Array<{ count: number }>;
  financialImpact: Array<{
    totalRefunded: number;
    avgRefund: number;
    maxRefund: number;
  }>;
  weeklyGrowth: Array<{
    label: string;
    amount_growth: number;
    count_growth: number;
    current_amount: number;
    current_count: number;
    previous_count: number;
    previous_amount: number;
  }>;
}
interface UserInterestAnalyticsResult {
  cart: {
    category: string; // category
    totalItems: number;
    uniqueUsers: string[]; // array of user IDs
    avgPrice: number;
    maxPrice: number;
    minPrice: number;
  };
  wishlist: {
    category: string; // category
    totalItems: number;
    uniqueUsers: string[]; // array of user IDs
    avgPrice: number;
    priceSensitivity: number;
  };

  purchase: {
    _id: string; // category
    totalItems: number;
    uniqueUsers: string[]; // array of user IDs
    avgPrice: number;
    maxPrice: number;
    minPrice: number;
  };
  combined: Array<{
    slug: string;
    name: string;
    category: string;
    cartCount: number;
    wishlistCount: number;
    interestScore: number; // Weighted score for ranking
  }>;
}
export interface ConversionMetrics {
  product_id: string;
  weeks: Array<{
    week: number;
    year: number;
    cartAdds: number;
    wishlistAdds: number;
    purchases: number;
    conversionRate: number;
  }>;
}
export interface DashboardDataAggregate {
  userAnalytics: UserAnalyticsResult;
  productAnalytics: ProductAnalyticsResult;
  userInterestAnalytics: UserInterestAnalyticsResult;
  orderAnalytics: OrderAnalyticsResult;
  reportAnalytics: ReportAnalyticsResult;
  refundAnalytics: RefundAnalyticsResult;
}
