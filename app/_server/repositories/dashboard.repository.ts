// src/repositories/dashboard.repo.ts
import { SecurityDashboardData } from "@/app/lib/types/security.types";
import { Types } from "mongoose";

export interface DashboardRepository {
  // getUserAnalytics(): Promise<{
  //   total: number;
  //   active: number;
  //   lastWeek: number;
  // }>;
  getUserAnalytics(): Promise<{
    total: number;
    active: number;
    lastWeek: number;
    demographics: {
      regions: Record<string, number>;
      ageGroups: Record<string, number>;
    };
  }>;

  getOrderAnalytics(): Promise<{
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
    totalEarnings: number;
    weeklyEarnings: number;
    dailyEarnings: number;
    weeklyTrend: Array<{ date: string; amount: number }>;
  }>;
  // getOrderAnalytics(): Promise<{
  //   total: number;
  //   completed: number;
  //   pending: number;
  //   cancelled: number;
  //   // statusCounts: Record<string, number>;
  //   totalEarnings: number;
  //   weeklyEarnings: number;
  //   dailyEarnings: number;
  // }>;

  // getOrderAnalytics(): Promise<{
  //   statusCounts: Record<string, number>;
  //   totalEarnings: number;
  //   weeklyEarnings: number;
  //   dailyEarnings: number;
  // }>;
  getProductAnalytics(): Promise<{
    total: number;
    outOfStock: number;
    lowStock: number;
    active: number;
    categoryDistribution: Record<string, number>;
    lastWeek: number;
    totalValue: number;
  }>;
  getReportAnalytics(): Promise<{
    total: number;
    resolved: number;
  }>;
  getRefundAnalytics(): Promise<{
    total: number;
    amount: number;
    trend: number;
  }>;
  getRecentActivities(): Promise<{
    recentOrders: any[];
    recentRefunds: any[];
  }>;
  getUserInterest(): Promise<{
    cartProducts: Array<{ productId: Types.ObjectId; count: number }>;
    wishlistProducts: Array<{ productId: Types.ObjectId; count: number }>;
  }>;
  getProductPerformance(): Promise<{
    topOrdered: Array<{
      productId: Types.ObjectId;
      name: string;
      totalQuantity: number;
      totalOrders: number;
    }>;
    dailyOrders: number;
  }>;
  getSecurityAnalytics(): Promise<SecurityDashboardData>;
}
