// src/services/dashboard.service.ts
import type { DashboardDataApi } from "@/app/lib/types/dashboard.types";

import { DashboardRepository } from "../repositories/dashboard.repository";

export class DashboardService {
  constructor(
    private readonly repo: DashboardRepository = new DashboardRepository()
  ) {}
  async getMainDashboard(): Promise<DashboardDataApi> {
    const [users, orders, products, reports, refunds, userInterestProducts] =
      await Promise.all([
        this.repo.getUserAnalytics(),
        this.repo.getOrderAnalytics(),
        this.repo.getProductAnalytics(),
        this.repo.getReportAnalytics(),
        this.repo.getRefundAnalytics(),
        this.repo.getUserInterestAnalytics(),
      ]);

    return {
      users,
      orders,
      products,
      reports,
      refunds,
      userInterestProducts,
    };
  }

  // private combineUserInterest(
  //   cartProducts: Array<{ product_id: any; count: number }>,
  //   wishlistProducts: Array<{ product_id: any; count: number }>
  // ): Array<{ product_id: string; count: number }> {
  //   const combined = new Map<string, number>();

  //   const addToMap = (items: Array<{ product_id: any; count: number }>) => {
  //     items.forEach(({ product_id, count }) => {
  //       const id = product_id.toString();
  //       combined.set(id, (combined.get(id) || 0) + count);
  //     });
  //   };

  //   addToMap(cartProducts);
  //   addToMap(wishlistProducts);

  //   return Array.from(combined.entries())
  //     .sort((a, b) => b[1] - a[1])
  //     .slice(0, 10)
  //     .map(([product_id, count]) => ({ product_id, count }));
  // }

  // private generateSlug(name: string): string {
  //   return name
  //     .toLowerCase()
  //     .replace(/\s+/g, "-")
  //     .replace(/[^a-z0-9-]/g, "");
  // }

  // private calculateGrowth(current: number, previous: number): number {
  //   if (previous === 0) return current > 0 ? 100 : 0;
  //   return this.roundPercentage(((current - previous) / previous) * 100);
  // }

  // private roundCurrency(value: number): number {
  //   return Number(value.toFixed(2));
  // }

  // private roundPercentage(value: number): number {
  //   return Number(value.toFixed(1));
  // }
}
// export class DashboardService2 {
//   constructor(private readonly repo: DashboardRepository) {}

//   async getMainDashboard(): Promise<DashboardDataApi> {
//     const [
//       users,
//       orders,
//       products,
//       reports,
//       refunds,
//       recentActivities,
//       userInterest,
//       productPerformance,
//     ] = await Promise.all([
//       this.repo.getUserAnalytics(),
//       this.repo.getOrderAnalytics(),
//       this.repo.getProductAnalytics(),
//       this.repo.getReportAnalytics(),
//       this.repo.getRefundAnalytics(),
//       this.repo.getRecentActivities(),
//       this.repo.getUserInterest(),
//       this.repo.getProductPerformance(),
//     ]);

//     // Calculate derived metrics
//     const resolutionRate =
//       reports.total > 0 ? (reports.resolved / reports.total) * 100 : 0;

//     const averageOrderValue =
//       orders.completed > 0 ? orders.totalEarnings / orders.completed : 0;

//     const conversionRate =
//       orders.total > 0 ? (orders.completed / orders.total) * 100 : 0;

//     // Combine user interest data
//     const combinedInterest = this.combineUserInterest(
//       userInterest.cartProducts,
//       userInterest.wishlistProducts
//     );

//     return {
//       users: {
//         ...users,
//         growthPercentage: this.calculateGrowth(users.lastWeek, users.total),
//         demographics: {
//           regions: users.demographics?.regions || {},
//           ageGroups: users.demographics?.ageGroups || {},
//         },
//       },
//       orders: {
//         total: orders.total,
//         completed: orders.completed,
//         pending: orders.pending,
//         cancelled: orders.cancelled,
//         earnings: {
//           current: this.roundCurrency(orders.totalEarnings),
//           trend: this.roundCurrency(orders.weeklyEarnings),
//           daily: this.roundCurrency(orders.dailyEarnings),
//           weeklyTrend: orders.weeklyTrend.map((t) => ({
//             date: t.date,
//             amount: this.roundCurrency(t.amount),
//           })),
//         },
//       },
//       products: {
//         total: products.total,
//         outOfStock: products.outOfStock,
//         lowStock: products.lowStock,
//         active: products.active,
//         categoryDistribution: products.categoryDistribution,
//         growthPercentage: this.calculateGrowth(
//           products.lastWeek,
//           products.total
//         ),
//         lastWeek: products.lastWeek,
//       },
//       sales: {
//         total: orders.completed,
//         averageOrderValue: this.roundCurrency(averageOrderValue),
//         conversionRate: this.roundPercentage(conversionRate),
//       },
//       refunds: {
//         total: refunds.total,
//         amount: this.roundCurrency(refunds.amount),
//         trend: this.roundPercentage(refunds.trend),
//       },
//       inventory: {
//         totalValue: this.roundCurrency(products.totalValue),
//         stockAlerts: products.outOfStock + products.lowStock,
//       },
//       reports: {
//         total: reports.total,
//         resolved: reports.resolved,
//         unresolved: reports.total - reports.resolved,
//         resolutionRate: this.roundPercentage(resolutionRate),
//       },
//       recentActivities: {
//         orders: recentActivities.recentOrders,
//         refunds: recentActivities.recentRefunds,
//       },
//       userInterestProducts: combinedInterest,
//       topOrderedProducts: productPerformance.topOrdered.map((p) => ({
//         product_id: p.product_id.toString(),
//         totalQuantity: p.totalQuantity,
//         productSlug: this.generateSlug(p.name),
//       })),
//       dailyOrders: productPerformance.dailyOrders,
//     };
//   }

//   private combineUserInterest(
//     cartProducts: Array<{ product_id: any; count: number }>,
//     wishlistProducts: Array<{ product_id: any; count: number }>
//   ): Array<{ product_id: string; count: number }> {
//     const combined = new Map<string, number>();

//     const addToMap = (items: Array<{ product_id: any; count: number }>) => {
//       items.forEach(({ product_id, count }) => {
//         const id = product_id.toString();
//         combined.set(id, (combined.get(id) || 0) + count);
//       });
//     };

//     addToMap(cartProducts);
//     addToMap(wishlistProducts);

//     return Array.from(combined.entries())
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 10)
//       .map(([product_id, count]) => ({ product_id, count }));
//   }

//   private generateSlug(name: string): string {
//     return name
//       .toLowerCase()
//       .replace(/\s+/g, "-")
//       .replace(/[^a-z0-9-]/g, "");
//   }

//   private calculateGrowth(current: number, previous: number): number {
//     if (previous === 0) return current > 0 ? 100 : 0;
//     return this.roundPercentage(((current - previous) / previous) * 100);
//   }

//   private roundCurrency(value: number): number {
//     return Number(value.toFixed(2));
//   }

//   private roundPercentage(value: number): number {
//     return Number(value.toFixed(1));
//   }
// }
