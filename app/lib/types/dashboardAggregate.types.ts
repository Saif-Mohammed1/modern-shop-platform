import type { Types } from "mongoose";

import type { OrderType } from "./orders.types";

interface AggregationResultItem<T = unknown> {
  [key: string]: T;
}

interface UserAnalyticsResult {
  total?: AggregationResultItem<number>[];
  active?: AggregationResultItem<number>[];
  recent?: AggregationResultItem<number>[];
  demographics?: Array<{ _id: string; count: number; devices: string[] }>;
  securitySummary?: Array<{
    lockedAccounts: number;
    twoFactorAdoption: number;
    highRiskUsers: number;
  }>;
  authActivity?: Array<{
    logins: number;
    failures: number;
    locations: unknown[];
  }>;
  threatAnalysis?: Array<{
    impossibleTravel: number;
    suspiciousDevices: number;
    botAttempts: number;
  }>;
  rateLimits?: Array<{ loginLockouts: number; passwordResets: number }>;
  activityTrends?: Array<{ _id: string; attempts: number; failures: number }>;
  trafficSources?: Array<{
    city: string;
    country: string;
    logins: number;
    uniqueUsers: number;
    commonDevices: string[];
    commonBrowsers: string[];
    coordinates: { lat: number; lng: number };
  }>;
  deviceUsage?: Array<{
    device: string;
    // browser: string;
    os: string;
    count: number;
    citiesCoverage: number;
  }>;
  weeklyGrowth?: Array<{
    label: string;
    currentLogins: number;
    previousLogins: number;
    growthPercentage: number;
  }>;
}
interface ProductAnalyticsResult {
  stockInfo?: Array<{
    total: number;
    outOfStock: number;
    lowStock: number;
    active: number;
    totalInventoryValue: number;
    totalReservedValue: number;
  }>;
  salesMetrics?: Array<{
    totalSold: number;
    totalRevenue: number;
    avgSalesPerProduct: number;
    topSelling: number;
  }>;
  discountAnalysis?: Array<{
    activeDiscounts: number;
    expiringSoon: number;
    avgDiscount: number;
  }>;
  engagementMetrics?: Array<{
    avgRating: number;
    totalReviews: number;
    recentlyReviewed: number;
  }>;
  categoryDistribution?: Array<{
    _id: string;
    count: number;
    totalSales: number;
    avgPrice: number;
    avgStock: number;
  }>;
  recentActivity?: Array<{
    _id: Types.ObjectId;
    name: string;
    type: "New Product" | "Updated Product";

    modifiedBy: string;
  }>;
  shippingMetrics?: Array<{
    avgWeight: number;
    totalVolume: number;
  }>;
  riskAnalysis?: Array<{ riskyProducts: number }>;
  weeklyGrowth?: Array<{
    label: string;
    salesGrowth: number;
    revenueGrowth: number;
    currentSales: number;
    currentRevenue: number;
  }>;
}
interface OrderAnalyticsResult {
  summary?: Array<{
    totalOrders: number;
    completedOrders: number;
    avgOrderValue: number;
    totalRevenue: number;
    avgItemsPerOrder: number;
  }>;
  financials?: Array<{
    netRevenue: number;
    totalTax: number;
    avgProcessingCost: number;
    refunds: number;
  }>;
  customerInsights?: Array<{
    repeatCustomers: number;
    avgLifetimeValue: number;
    topSpender: number;
  }>;
  productAnalytics?: Array<{
    _id: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  timeSeries?: Array<{
    _id: { year: number; month: number };
    count: number;
    revenue: number;
    avgOrderValue: number;
  }>;
  geographicInsights?: Array<{
    _id: string;
    state: string;
    country: string;
    orderCount: number;
    totalRevenue: number;
  }>;
  paymentMethods?: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  fulfillment?: Array<{
    _id: string;
    count: number;
    avgFulfillmentTime: number;
  }>;
  weeklyComparison?: Array<{
    week: string;
    currentWeek: number;
    previousWeek: number;
    growthRate: number;
  }>;
  recentOrders?: (Omit<OrderType, "_id"> & {
    _id: Types.ObjectId;
  })[]; // Replace with proper type if possible
  weeklyGrowth?: Array<{
    label: string;
    orderGrowth: number;
    revenueGrowth: number;
    currentOrders: number;
    currentRevenue: number;
  }>;
}

interface ReportAnalyticsResult {
  summary?: Array<{
    total: number;
    resolved: number;
    avgResolutionHours: number;
  }>;
  statusDistribution?: Array<{ _id: string; count: number }>;
  recentReports?: Array<{
    _id: string;
    issue: string;
    status: string;
    product: string;
    reporter: string;
    createdAt: Date;
  }>;
  trendAnalysis?: Array<{ _id: string; count: number }>;
  commonIssues?: Array<{
    _id: string;
    count: number;
    products: string[];
  }>;
  weeklyGrowth?: Array<{
    label: string;
    resolutionGrowth: number;
    reportGrowth: number;
    currentResolved: number;
    currentTotal: number;
  }>;
}

interface RefundAnalyticsResult {
  summary: Array<{
    total: number;
    totalAmount: number;
    approved: number;
    avgProcessingHours: number;
  }>;
  statusTrend: Array<{
    _id: { week: number; status: string };
    count: number;
  }>;
  recentRefunds: Array<{
    _id: Types.ObjectId;
    amount: number;
    status: string;
    user: string;
    createdAt: Date;
    invoiceId: string;
  }>;
  commonReasons: Array<{
    _id: string;
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
    amountGrowth: number;
    countGrowth: number;
    currentAmount: number;
    currentCount: number;
  }>;
}
interface UserInterestAnalyticsResult {
  cart: {
    _id: string; // category
    totalItems: number;
    uniqueUsers: string[]; // array of user IDs
    avgPrice: number;
    maxPrice: number;
    minPrice: number;
  };
  wishlist: {
    _id: string; // category
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
  CombinedData: {
    productId: Types.ObjectId;
    week: number;
    cartAdds: number;
    purchases: number;
    conversionRate: number;
  };
}

export interface DashboardDataAggregate {
  userAnalytics: UserAnalyticsResult;
  productAnalytics: ProductAnalyticsResult;
  orderAnalytics: OrderAnalyticsResult;
  reportAnalytics: ReportAnalyticsResult;
  refundAnalytics: RefundAnalyticsResult;
  userInterestAnalytics: UserInterestAnalyticsResult;
}
