// src/repositories/dashboard.repo.ts
// import { SecurityDashboardData } from "@/app/lib/types/security.types";
// import { Types } from "mongoose";

import type { DashboardData } from "@/app/lib/types/dashboard.types";

export interface BaseDashboardRepository {
  getUserAnalytics(): Promise<DashboardData["users"]>;
  getProductAnalytics(): Promise<DashboardData["products"]>;
  getOrderAnalytics(): Promise<DashboardData["orders"]>;
  getReportAnalytics(): Promise<DashboardData["reports"]>;
  getRefundAnalytics(): Promise<DashboardData["refunds"]>;
  getUserInterestAnalytics(): Promise<DashboardData["userInterestProducts"]>;

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
