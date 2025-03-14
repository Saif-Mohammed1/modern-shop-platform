// src/repositories/dashboard.repo.ts
import { SecurityDashboardData } from "@/app/lib/types/security.types";
import { Types } from "mongoose";
interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  recentSignups: number;
  languageDistribution: Record<string, number>;
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
}

export interface BaseDashboardRepository {
  getUserAnalytics(): Promise<UserAnalytics>;
  getProductAnalytics(): Promise<ProductAnalytics>;
  getOrderAnalytics(): Promise<OrderAnalytics>;
  getReportAnalytics(): Promise<ReportAnalytics>;
  getRefundAnalytics(): Promise<RefundAnalytics>;
  // getRecentActivities(): Promise<{
  //   recentOrders: any[];
  //   recentRefunds: any[];
  // }>;
  // getUserInterest(): Promise<{
  //   cartProducts: Array<{ productId: Types.ObjectId; count: number }>;
  //   wishlistProducts: Array<{ productId: Types.ObjectId; count: number }>;
  // }>;
  // getProductPerformance(): Promise<{
  //   topOrdered: Array<{
  //     productId: Types.ObjectId;
  //     name: string;
  //     totalQuantity: number;
  //     totalOrders: number;
  //   }>;
  //   dailyOrders: number;
  // }>;
  // getSecurityAnalytics(): Promise<SecurityDashboardData>;
}
