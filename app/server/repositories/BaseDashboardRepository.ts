// src/repositories/dashboard.repo.ts
// import { SecurityDashboardData } from "@/app/lib/types/security.types";
// import { Types } from "mongoose";
import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

export interface BaseDashboardRepository {
  getUserAnalytics(): Promise<DashboardDataApi["users"]>;
  getProductAnalytics(): Promise<DashboardDataApi["products"]>;
  getOrderAnalytics(): Promise<DashboardDataApi["orders"]>;
  getReportAnalytics(): Promise<DashboardDataApi["reports"]>;
  getRefundAnalytics(): Promise<DashboardDataApi["refunds"]>;
  getUserInterestAnalytics(): Promise<DashboardDataApi["userInterestProducts"]>;

  // getRecentActivities(): Promise<{
  //   recentOrders: any[];
  //   recentRefunds: any[];
  // }>;
  // getUserInterest(): Promise<{
  //   cartProducts: Array<{ product_id: Types.ObjectId; count: number }>;
  //   wishlistProducts: Array<{ product_id: Types.ObjectId; count: number }>;
  // }>;
  // getProductPerformance(): Promise<{
  //   topOrdered: Array<{
  //     product_id: Types.ObjectId;
  //     name: string;
  //     totalQuantity: number;
  //     totalOrders: number;
  //   }>;
  //   dailyOrders: number;
  // }>;
  // getSecurityAnalytics(): Promise<SecurityDashboardData>;
}
