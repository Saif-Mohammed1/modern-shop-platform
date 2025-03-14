import { IOrder } from "@/app/_server/models/Order.model ";
import { IRefundSchema } from "@/app/_server/models/Refund.model";

export interface DashboardData {
  users: {
    total: number;
    growthPercentage: number;
    lastWeek: number;
    active: number;
    // NEW: Add user demographics
    demographics: {
      regions: Record<string, number>;
      ageGroups: Record<string, number>;
    };
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    earnings: {
      current: number;
      trend: number;
      daily: number;
      // daily: { date: string; amount: number }[];
      // NEW: Add weekly trend data
      weeklyTrend: Array<{ date: string; amount: number }>;
    };
  };
  products: {
    total: number;
    outOfStock: number;
    lowStock: number;
    active: number;
    categoryDistribution: Record<string, number>;
    growthPercentage: number;
    lastWeek: number;
  };
  sales: {
    total: number;
    averageOrderValue: number;
    conversionRate: number;
  };
  refunds: {
    total: number;
    amount: number;
    trend: number;
    // recent: IRefundSchema[];
  };
  inventory: {
    totalValue: number;
    stockAlerts: number;
  };
  reports: {
    total: number;
    resolved: number;
    unresolved: number;
    resolutionRate: number;
  };
  recentActivities: {
    orders: IOrder[];
    refunds: IRefundSchema[];
  };
  userInterestProducts: Array<{ productId: string; count: number }>;
  topOrderedProducts: Array<{
    productId: string;
    totalQuantity: number;
    productSlug: string;
  }>;
  dailyOrders: number;
}
