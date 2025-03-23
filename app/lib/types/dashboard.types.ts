import { IOrder } from "@/app/server/models/Order.model";
import { IRefundSchema } from "@/app/server/models/Refund.model";
interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  languageDistribution: Record<string, number>;
  geographicalInsights: {
    // topCountries: Array<{ country: string; count: number }>;
    // topCities: Array<{ city: string; count: number }>;
    topLocations: Array<{
      logins: number;
      coordinates: {
        lat: number;
        lng: number;
      };
      city: string;
      country: string;
      uniqueUsers: number;
      commonDevices: string[];
      commonBrowsers: string[];
      growthPercentage: number;
    }>;
    deviceDistribution: Array<{
      count: number;
      device: string;
      os: string;
      browser: string;
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
      impossibleTravel: number;
      suspiciousDevices: number;
      botAttempts: number;
    };

    rateLimits: {
      activeLockouts: number;
      passwordResetAttempts: number;
    };

    trends: [{ date: string; attempts: number; successRate: string }];
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
    _id: string;
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
    revenueGrowth: number;
    currentSales: number;
    currentRevenue: number;
  }>;
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
    processingCosts: number;
    netProfitMargin: {
      monthly: number;
    };
    refundRate: number;
    weeklyGrowth: number;
  };
  customerBehavior: {
    repeatRate: number;
    avgLTV: number;
    topSpender: number;
  };
  topProducts: Array<{
    productId: string;
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
  recentOrders: IOrder[];
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
    createdAt: Date;
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
    createdAt: Date;
    invoiceId: string;
  }>;
  weeklyGrowth: Array<{
    label: string;
    amountGrowth: string;
    countGrowth: string;
    currentAmount: number;
    currentCount: number;
  }>;
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
    productId: string;
    weeks: {
      week: number;
      cartAdds: number;
      purchases: number;
      conversionRate: number;
    }[];
  }>;
  highInterestProducts: {
    frequentlyCartAdded: FrequentlyProductsPurchased[];
    frequentlyWishlisted: FrequentlyProductsPurchased[];
    abandonedItems: {
      _id: string;
      count: number;
      productId: string;
      name: string;
      stock: number;
    }[];
  };
}
interface FrequentlyProductsPurchased {
  _id: string;
  count: number;
  productId: string;
  name: string;
  category: string;
  price: number;
}
export interface DashboardData {
  users: UserAnalytics;
  orders: OrderAnalytics;
  products: ProductAnalytics;

  refunds: RefundAnalytics;

  reports: ReportAnalytics;

  userInterestProducts: UserInterestProducts;
}

// export interface DashboardData {
//   users: {
//     total: number;
//     growthPercentage: number;
//     lastWeek: number;
//     active: number;
//     // NEW: Add user demographics
//     demographics: {
//       regions: Record<string, number>;
//       ageGroups: Record<string, number>;
//     };
//   };
//   orders: {
//     total: number;
//     completed: number;
//     pending: number;
//     cancelled: number;
//     earnings: {
//       current: number;
//       trend: number;
//       daily: number;
//       // daily: { date: string; amount: number }[];
//       // NEW: Add weekly trend data
//       weeklyTrend: Array<{ date: string; amount: number }>;
//     };
//   };
//   products: {
//     total: number;
//     outOfStock: number;
//     lowStock: number;
//     active: number;
//     categoryDistribution: Record<string, number>;
//     growthPercentage: number;
//     lastWeek: number;
//   };
//   sales: {
//     total: number;
//     averageOrderValue: number;
//     conversionRate: number;
//   };
//   refunds: {
//     total: number;
//     amount: number;
//     trend: number;
//     // recent: IRefundSchema[];
//   };
//   inventory: {
//     totalValue: number;
//     stockAlerts: number;
//   };
//   reports: {
//     total: number;
//     resolved: number;
//     unresolved: number;
//     resolutionRate: number;
//   };
//   recentActivities: {
//     orders: IOrder[];
//     refunds: IRefundSchema[];
//   };
//   userInterestProducts: Array<{ productId: string; count: number }>;
//   topOrderedProducts: Array<{
//     productId: string;
//     totalQuantity: number;
//     productSlug: string;
//   }>;
//   dailyOrders: number;
// }
