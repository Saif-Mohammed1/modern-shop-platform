// import type { OrderType } from "./orders.db.types";

interface FrequentlyProductsPurchased {
  slug: string;
  count: number;
  // product_id: string;
  name: string;
  category: string;
  price: number;
}
interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  languageDistribution: Record<string, number>;
  geographicalInsights: {
    topLocations: {
      city: string;
      country: string;
      logins: number;
      uniqueUsers: number;
      commonDevices: string[];
      commonBrowsers: string[];
      coordinates: {
        lat: number;
        lng: number;
      };
      growthPercentage: number;
    }[];
    deviceDistribution: Array<{
      count: number;
      device: string;
      os: string;
      // browser: string;
      // device: "Desktop" | "Mobile" | "Tablet" | "Unknown";
      // os:
      //   | "Windows"
      //   | "MacOS"
      //   | "Linux"
      //   | "Android"
      //   | "iOS"
      //   | "Other"
      //   | "Unknown OS";
      // browser: "Chrome" | "Safari" | "Firefox" | "Edge" | "Opera" | "Other";
      citiesCoverage: number;
    }>;
    totalCities: number;
  };
  security: {
    twoFactorAdoption: number;
    lockedAccounts: number;
    highRiskUsers: number;

    authActivity: {
      loginsLast24h: number;
      failedAttempts: number;
      uniqueLocations: number;
    };

    threats: {
      impossible_travel: number;
      suspiciousDevices: number;
      botAttempts: number;
    };

    rateLimits: {
      activeLockouts: number;
      passwordResetAttempts: number;
    };

    trends: Array<{ date: string; attempts: number; successRate: string }>;
  };
  deviceDiversity: {
    totalDevices: number;
  };
  weeklyGrowth: Array<{
    label: string;
    currentLogins: number;
    previousLogins: number;
    growthPercentage: string;
  }>;
}
interface ProductAnalytics {
  inventory: {
    total: number;
    outOfStock: number;
    lowStock: number;
    active: number;
    totalValue: number;
    reservedValue: number;
  };
  sales: {
    totalSold: number;
    totalRevenue: number;
    avgSales: number;
    topSelling: number;
  };
  discounts: {
    active: number;
    expiringSoon: number;
    avgDiscount: number;
  };
  engagement: {
    avgRating: number;
    totalReviews: number;
    recentReviews: number;
  };
  categories: {
    name: string;
    count: number;
    sales: number;
    avgPrice: number;
    avgStock: number;
  }[];
  recentChanges: {
    slug: string;
    name: string;
    type: "New Product" | "Updated Product";
    modifiedBy: string;
  }[];
  shipping: {
    avgWeight: number;
    totalVolume: number;
  };
  risk: {
    stockConflicts: number;
  };
  weeklyGrowth: Array<{
    label: string;
    salesGrowth: number;
    currentSales: number;
    previousSales: number;
    currentRevenue: number;
    revenueGrowth: number;
    previousRevenue: number;
  }>;
  // demandForecast: {
  reservations: {
    reservedQuantity: number;
    reservedValue: number;
    avgReservationDuration: number;
    conversionRate: number; // Reservations to actual purchases
    abandonmentRate: number;
  };
}
interface OrderAnalytics {
  summary: {
    totalOrders: number;
    completedOrders: number;
    avgOrderValue: number;
    totalRevenue: number;
    avgItemsPerOrder: number;
  };
  financialHealth: {
    netRevenue: number;
    totalTax: number;
    // processingCosts: number;
    // netProfitMargin: {
    //   monthly: number;
    // };
    refundRate: number;
    weeklyGrowth: number;
  };
  customerBehavior: {
    repeatRate: number;
    avgLTV: number;
    topSpender: number;
  };
  topProducts: Array<{
    product_id: string;
    name: string;
    unitsSold: number;
    revenue: number;
  }>;
  trends: {
    monthly: Array<{
      period: string;
      orders: number;
      revenue: number;
      aov: number;
    }>;
    yoyGrowth: number;
    weeklyBreakdown: Array<{
      week: string;
      current: number;
      previous: number;
      growth: number;
    }>;
  };
  fulfillment: {
    statusDistribution: Record<string, { count: number; avgHours: number }>;
    slaCompliance: number;
  };
  paymentMethods: Array<{
    method: string;
    usageCount: number;
    totalProcessed: number;
  }>;
  topLocations: Array<{
    city: string;
    state: string;
    country: string;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders: {
    _id: string;
    status: string;
    total: number;
    created_at: Date;
    items: Array<{
      name: string;
      price: number;
      quantity: number;
    }>;
  }[];
  weeklyGrowth: Array<{
    label: string;
    orderGrowth: number;
    revenueGrowth: number;
    currentOrders: number;
    currentRevenue: number;
  }>;
}

interface ReportAnalytics {
  total: number;
  resolved: number;
  resolutionRate: number;
  avgResolutionTime: number;
  statusBreakdown: Record<string, number>;
  trendingIssues: Array<{
    issue: string;
    count: number;
    affectedProducts: string[];
  }>;
  recentReports: Array<{
    _id: string;
    issue: string;
    status: string;
    product: string;
    reporter: string;
    created_at: Date;
  }>;
  dailyTrend: Array<{ date: string; reports: number }>;
  weeklyTrends: Array<{
    label: string;
    resolutionGrowth: string;
    reportGrowth: string;
    currentResolved: number;
    currentTotal: number;
  }>;
}

interface RefundAnalytics {
  total: number;
  totalAmount: number;
  approvalRate: number;
  avgProcessingTime: number;
  weeklyTrend: Record<string, Record<string, number>>;
  commonReasons: Array<{
    reason: string;
    frequency: number;
    financialImpact: number;
  }>;
  recentRefunds: Array<{
    _id: string;
    amount: number;
    status: string;
    user: string;
    created_at: Date;
    invoice_id: string;
  }>;
  weeklyGrowth: Array<{
    label: string;
    amountGrowth: string;
    countGrowth: string;
    currentAmount: number;
    currentCount: number;
  }>;
  highRiskRefunds: { count: number };
  financialImpact: {
    totalRefunded: number;
    avgRefund: number;
    maxRefund: number;
  };
  // weeklyGrowth: Array<{
  //   week: string;
  //   year: number;
  //   totalAmount: number;
  //   count: number;
  //   growthPercentage: string;
  // }>;
}
interface UserInterestProducts {
  categoryAnalysis: {
    cart: Array<{
      category: string;
      totalItems: number;
      uniqueUsers: number;
      priceRange: {
        min: number;
        max: number;
        avg: number;
      };
    }>;
    wishlist: Array<{
      category: string;
      totalItems: number;
      uniqueUsers: number;
      priceSensitivity: number;
    }>;
  };
  conversionMetrics: Array<{
    product_id: string;
    weeks: {
      week: number;
      cartAdds: number;
      purchases: number;
      conversionRate: number;
    }[];
  }>;
  combined: {
    slug: string;
    name: string;
    category: string;
    cartCount: number;
    wishlistCount: number;
    interestScore: number;
  }[];
  highInterestProducts: {
    frequentlyCartAdded: FrequentlyProductsPurchased[];
    frequentlyWishlisted: FrequentlyProductsPurchased[];
    abandonedItems: {
      slug: string;
      count: number;
      // product_id: string;
      name: string;
      stock: number;
    }[];
  };
}

export interface DashboardDataApi {
  users: UserAnalytics;
  orders: OrderAnalytics;
  products: ProductAnalytics;

  refunds: RefundAnalytics;

  reports: ReportAnalytics;

  userInterestProducts: UserInterestProducts;
}
