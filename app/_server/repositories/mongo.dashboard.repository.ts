// // src/repositories/impl/mongo.dashboard.repo.ts

// import { DateTime } from "luxon";
// import { DashboardRepository } from "./dashboard.repository";
// import OrderModel from "../models/order.model ";
// import UserModel from "../models/User.model";
// import ProductModel from "../models/Product.model";
// import Report from "../models/report.model";
// import Refund from "../models/refund.model";
// import CartModel from "../models/Cart.model";
// import WishlistModel from "../models/Wishlist.model";

// export class MongoDashboardRepository implements DashboardRepository {
//   async getUserAnalytics() {
//     const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();

//     const [result] = await UserModel.aggregate([
//       {
//         $facet: {
//           total: [{ $count: "total" }],
//           active: [{ $match: { active: true } }, { $count: "active" }],
//           lastWeek: [
//             { $match: { createdAt: { $gte: lastWeekDate } } },
//             { $count: "lastWeek" },
//           ],
//         },
//       },
//     ]);

//     return {
//       total: result.total[0]?.total || 0,
//       active: result.active[0]?.active || 0,
//       lastWeek: result.lastWeek[0]?.lastWeek || 0,
//     };
//   }
//   async getOrderAnalytics() {
//     const [result] = await OrderModel.aggregate([
//       {
//         $facet: {
//           statusCounts: [
//             {
//               $group: {
//                 _id: "$status",
//                 count: { $sum: 1 },
//               },
//             },
//           ],
//           totalEarnings: [
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$total" },
//               },
//             },
//           ],
//           weeklyEarnings: [
//             {
//               $match: {
//                 createdAt: {
//                   $gte: DateTime.now().minus({ weeks: 1 }).toJSDate(),
//                 },
//               },
//             },
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$total" },
//               },
//             },
//           ],
//           dailyEarnings: [
//             {
//               $match: {
//                 createdAt: {
//                   $gte: DateTime.now().startOf("day").toJSDate(),
//                 },
//               },
//             },
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$total" },
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     return {
//       statusCounts: result.statusCounts.reduce(
//         (
//           acc: Record<string, number>,
//           { _id, count }: { _id: string; count: number }
//         ) => ({ ...acc, [_id]: count }),
//         {}
//       ),
//       totalEarnings: result.totalEarnings[0]?.total || 0,
//       weeklyEarnings: result.weeklyEarnings[0]?.total || 0,
//       dailyEarnings: result.dailyEarnings[0]?.total || 0,
//     };
//   }
//   async getProductAnalytics() {
//     const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();

//     const [result] = await ProductModel.aggregate([
//       {
//         $facet: {
//           total: [{ $count: "total" }],
//           outOfStock: [{ $match: { stock: 0 } }, { $count: "outOfStock" }],
//           lowStock: [
//             { $match: { stock: { $lte: 10 } } },
//             { $count: "lowStock" },
//           ],
//           active: [{ $match: { isActive: true } }, { $count: "active" }],
//           categoryDistribution: [
//             {
//               $group: {
//                 _id: "$category",
//                 count: { $sum: 1 },
//               },
//             },
//           ],
//           lastWeek: [
//             { $match: { createdAt: { $gte: lastWeekDate } } },
//             { $count: "lastWeek" },
//           ],
//           totalValue: [
//             {
//               $group: {
//                 _id: null,
//                 total: { $sum: "$price" },
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     return {
//       total: result.total[0]?.total || 0,
//       outOfStock: result.outOfStock[0]?.outOfStock || 0,
//       lowStock: result.lowStock[0]?.lowStock || 0,
//       active: result.active[0]?.active || 0,
//       categoryDistribution: result.categoryDistribution.reduce(
//         (
//           acc: Record<string, number>,
//           { _id, count }: { _id: string; count: number }
//         ) => ({ ...acc, [_id]: count }),
//         {}
//       ),
//       lastWeek: result.lastWeek[0]?.lastWeek || 0,
//       totalValue: result.totalValue[0]?.total || 0,
//     };
//   }
//   async getReportAnalytics() {
//     const [result] = await Report.aggregate([
//       {
//         $facet: {
//           total: [{ $count: "total" }],
//           resolved: [{ $match: { resolved: true } }, { $count: "resolved" }],
//         },
//       },
//     ]);

//     return {
//       total: result.total[0]?.total || 0,
//       resolved: result.resolved[0]?.resolved || 0,
//     };
//   }
//   async getRefundAnalytics() {
//     const [result] = await Refund.aggregate([
//       {
//         $facet: {
//           total: [{ $count: "total" }],
//           amount: [{ $group: { _id: null, total: { $sum: "$refundAmount" } } }],
//           trend: [
//             {
//               $group: {
//                 _id: null,
//                 trend: {
//                   $sum: {
//                     $cond: [{ $gt: ["$refundAmount", 0] }, 1, -1],
//                   },
//                 },
//               },
//             },
//           ],
//         },
//       },
//     ]);

//     return {
//       total: result.total[0]?.total || 0,
//       amount: result.amount[0]?.total || 0,
//       trend: result.trend[0]?.trend || 0,
//     };
//   }
//   async getRecentActivities() {
//     const recentOrders = await OrderModel.find()
//       .sort({ createdAt: -1 })
//       .limit(5)
//       .lean();
//     const recentRefunds = await Refund.find({ status: "approved" })
//       .sort({ refundedAt: -1 })
//       .limit(5)
//       .lean();

//     return {
//       recentOrders,
//       recentRefunds,
//     };
//   }
//   async getUserInterest() {
//     const cartProducts = await CartModel.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $group: {
//           _id: "$products.productId",
//           count: { $sum: "$products.quantity" },
//         },
//       },
//     ]);

//     const wishlistProducts = await WishlistModel.aggregate([
//       {
//         $unwind: "$wishlist",
//       },
//       {
//         $group: {
//           _id: "$wishlist.productId",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     return {
//       cartProducts,
//       wishlistProducts,
//     };
//   }
//   async getProductPerformance() {
//     const topOrdered = await OrderModel.aggregate([
//       {
//         $unwind: "$products",
//       },
//       {
//         $group: {
//           _id: "$products.productId",
//           totalQuantity: { $sum: "$products.quantity" },
//           totalOrders: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { totalQuantity: -1 },
//       },
//       {
//         $limit: 5,
//       },
//     ]);

//     const dailyOrders = await OrderModel.countDocuments({
//       createdAt: {
//         $gte: DateTime.now().startOf("day").toJSDate(),
//       },
//     });

//     return {
//       topOrdered,
//       dailyOrders,
//     };
//   }

//   // Implement other repository methods similarly...
// }

// src/repositories/impl/mongo.dashboard.repo.ts
import { DateTime } from "luxon";
import { Types } from "mongoose";
import { DashboardRepository } from "./dashboard.repository";
import UserModel from "../models/User.model";
import OrderModel, { IOrder } from "../models/Order.model ";
import ProductModel from "../models/Product.model";
import Report from "../models/report.model";
import Refund, { IRefundSchema } from "../models/refund.model";
import CartModel from "../models/Cart.model";
import WishlistModel from "../models/Wishlist.model";
import { SecurityDashboardData } from "@/app/lib/types/security.types";

interface AggregationResult {
  [key: string]: any[];
}

export class MongoDashboardRepository implements DashboardRepository {
  // User Analytics
  async getUserAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();

    const [result] = await UserModel.aggregate([
      {
        $facet: {
          total: [{ $count: "total" }],
          active: [{ $match: { active: true } }, { $count: "active" }],
          lastWeek: [
            { $match: { createdAt: { $gte: lastWeekDate } } },
            { $count: "lastWeek" },
          ],
          regions: [
            { $group: { _id: "$region", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          ageGroups: [
            {
              $project: {
                age: {
                  $floor: {
                    $divide: [
                      { $subtract: [new Date(), "$birthDate"] },
                      31536000000, // 1 year in milliseconds
                    ],
                  },
                },
              },
            },
            {
              $bucket: {
                groupBy: "$age",
                boundaries: [0, 18, 25, 35, 45, 55, 65, Infinity],
                default: "Unknown",
                output: { count: { $sum: 1 } },
              },
            },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result, "total"),
      active: this.getFirstNumber(result, "active"),
      lastWeek: this.getFirstNumber(result, "lastWeek"),
      demographics: {
        regions: this.mapToObject(result.regions),
        ageGroups: this.mapAgeGroups(result.ageGroups),
      },
    };
  }
  async getOrderAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const todayStart = DateTime.now().startOf("day").toJSDate();

    const [result] = await OrderModel.aggregate([
      {
        $facet: {
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          earnings: [
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          weeklyEarnings: [
            {
              $match: {
                createdAt: { $gte: lastWeekDate },
                status: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          dailyEarnings: [
            {
              $match: { createdAt: { $gte: todayStart }, status: "completed" },
            },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          weeklyTrend: [
            {
              $match: {
                createdAt: {
                  $gte: DateTime.now().minus({ weeks: 4 }).toJSDate(),
                },
                status: "completed",
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
                amount: { $sum: "$total" },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", amount: 1 } },
          ],
        },
      },
    ]);

    return {
      total: this.sumStatusCounts(result.statusCounts),
      completed: this.getStatusCount(result.statusCounts, "completed"),
      pending: this.getStatusCount(result.statusCounts, "pending"),
      cancelled: this.getStatusCount(result.statusCounts, "cancelled"),
      totalEarnings: this.getFirstNumber(result.earnings),
      weeklyEarnings: this.getFirstNumber(result.weeklyEarnings),
      dailyEarnings: this.getFirstNumber(result.dailyEarnings),
      weeklyTrend: result.weeklyTrend.map((t: any) => ({
        date: t.date,
        amount: Number(t.amount.toFixed(2)),
      })),
    };
  }
  // Order Analytics
  async getOrderAnalytics2() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const todayStart = DateTime.now().startOf("day").toJSDate();

    const [result] = await OrderModel.aggregate([
      {
        $facet: {
          statusCounts: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          earnings: [
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          weeklyEarnings: [
            {
              $match: {
                createdAt: { $gte: lastWeekDate },
                status: "completed",
              },
            },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          dailyEarnings: [
            {
              $match: { createdAt: { $gte: todayStart }, status: "completed" },
            },
            { $group: { _id: null, total: { $sum: "$total" } } },
          ],
          weeklyTrend: [
            {
              $match: {
                createdAt: {
                  $gte: DateTime.now().minus({ weeks: 4 }).toJSDate(),
                },
                status: "completed",
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%U", date: "$createdAt" } },
                amount: { $sum: "$total" },
              },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", amount: 1 } },
          ],
        },
      },
    ]);

    return {
      statusCounts: result.statusCounts.reduce(
        (
          acc: Record<string, number>,
          { _id, count }: { _id: string; count: number }
        ) => ({ ...acc, [_id]: count }),
        {}
      ),
      totalEarnings: this.getFirstNumber(result.earnings),
      weeklyEarnings: this.getFirstNumber(result.weeklyEarnings),
      dailyEarnings: this.getFirstNumber(result.dailyEarnings),
      weeklyTrend: result.weeklyTrend.map((t: any) => ({
        date: t.date,
        amount: Number(t.amount.toFixed(2)),
      })),
    };
  }

  // Product Analytics
  async getProductAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();

    const [result] = await ProductModel.aggregate([
      {
        $facet: {
          stockInfo: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                outOfStock: {
                  $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
                },
                lowStock: { $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] } },
                active: { $sum: { $cond: ["$isActive", 1, 0] } },
              },
            },
          ],
          categoryDistribution: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
          ],
          lastWeek: [
            { $match: { createdAt: { $gte: lastWeekDate } } },
            { $count: "count" },
          ],
          totalValue: [
            {
              $group: {
                _id: null,
                total: { $sum: { $multiply: ["$price", "$stock"] } },
              },
            },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result.stockInfo, "total"),
      outOfStock: this.getFirstNumber(result.stockInfo, "outOfStock"),
      lowStock: this.getFirstNumber(result.stockInfo, "lowStock"),
      active: this.getFirstNumber(result.stockInfo, "active"),
      categoryDistribution: this.mapToObject(result.categoryDistribution),
      lastWeek: this.getFirstNumber(result.lastWeek, "count"),
      totalValue: this.getFirstNumber(result.totalValue, "total"),
    };
  }

  // Report Analytics
  async getReportAnalytics() {
    const [result] = await Report.aggregate([
      // const [result] = await ReportModel.aggregate([
      {
        $facet: {
          total: [{ $count: "total" }],
          resolved: [
            { $match: { status: "resolved" } },
            { $count: "resolved" },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result, "total"),
      resolved: this.getFirstNumber(result, "resolved"),
    };
  }

  // Refund Analytics
  async getRefundAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();

    const [result] = await Refund.aggregate([
      // const [result] = await RefundModel.aggregate([
      {
        $facet: {
          total: [{ $count: "total" }],
          amount: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
          trend: [
            { $match: { createdAt: { $gte: lastWeekDate } } },
            { $count: "trend" },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result, "total"),
      amount: this.getFirstNumber(result.amount, "total"),
      trend: this.getFirstNumber(result.trend, "trend"),
    };
  }

  // Recent Activities
  async getRecentActivities() {
    const [recentOrders, recentRefunds] = await Promise.all([
      OrderModel.find().sort({ createdAt: -1 }).limit(5).lean<IOrder[]>(),
      Refund.find()
        // RefundModel.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean<IRefundSchema[]>(),
    ]);

    return {
      recentOrders,
      recentRefunds,
    };
  }

  // User Interest
  async getUserInterest() {
    const [cartProducts, wishlistProducts] = await Promise.all([
      CartModel.aggregate<{ productId: Types.ObjectId; count: number }>([
        { $unwind: "$items" },
        {
          $group: { _id: "$items.product", count: { $sum: "$items.quantity" } },
        },
        { $project: { productId: "$_id", count: 1, _id: 0 } },
      ]),
      WishlistModel.aggregate<{ productId: Types.ObjectId; count: number }>([
        { $unwind: "$items" },
        { $group: { _id: "$items.product", count: { $sum: 1 } } },
        { $project: { productId: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    return {
      cartProducts: cartProducts.map((p) => ({
        productId: p.productId,
        count: p.count,
      })),
      wishlistProducts: wishlistProducts.map((p) => ({
        productId: p.productId,
        count: p.count,
      })),
    };
  }

  // Product Performance
  async getProductPerformance() {
    const [topOrdered, dailyOrders] = await Promise.all([
      OrderModel.aggregate<{
        productId: Types.ObjectId;
        name: string;
        totalQuantity: number;
        totalOrders: number;
      }>([
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$product.name" },
            totalQuantity: { $sum: "$items.quantity" },
            totalOrders: { $sum: 1 },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $project: {
            productId: "$_id",
            name: 1,
            totalQuantity: 1,
            totalOrders: 1,
            _id: 0,
          },
        },
      ]),
      OrderModel.countDocuments({
        createdAt: { $gte: DateTime.now().startOf("day").toJSDate() },
      }),
    ]);

    return {
      topOrdered,
      dailyOrders,
    };
  }
  // src/repositories/impl/mongo.dashboard.repo.ts
  async getSecurityAnalytics(): Promise<SecurityDashboardData> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [summary, activity, threats, rateLimits, trends] = await Promise.all([
      // Summary Aggregation
      UserModel.aggregate([
        {
          $facet: {
            totalUsers: [{ $count: "count" }],
            lockedAccounts: [
              {
                $match: { "security.rateLimits.login.lockUntil": { $gt: now } },
              },
              { $count: "count" },
            ],
            twoFactorAdoption: [
              { $match: { "security.twoFactorEnabled": true } },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Activity Aggregation
      UserModel.aggregate([
        { $unwind: "$security.loginHistory" },
        { $match: { "security.loginHistory.timestamp": { $gte: last24h } } },
        {
          $group: {
            _id: null,
            logins: {
              $sum: { $cond: ["$security.loginHistory.success", 1, 0] },
            },
            failures: {
              $sum: { $cond: ["$security.loginHistory.success", 0, 1] },
            },
            passwordResets: {
              $sum: "$security.rateLimits.passwordReset.attempts",
            },
            verifications: {
              $sum: "$security.rateLimits.verification.attempts",
            },
          },
        },
      ]),

      // Threat Detection
      UserModel.aggregate([
        {
          $group: {
            _id: null,
            impossibleTravel: {
              $sum: {
                $cond: ["$security.behavioralFlags.impossibleTravel", 1, 0],
              },
            },
            suspiciousDevices: {
              $sum: {
                $cond: [
                  "$security.behavioralFlags.suspiciousDeviceChange",
                  1,
                  0,
                ],
              },
            },
            highVelocity: {
              $sum: {
                $cond: [
                  { $gt: ["$security.behavioralFlags.requestVelocity", 10] },
                  1,
                  0,
                ],
              },
            },
            botAttempts: {
              $sum: { $cond: ["$security.loginHistory.isBot", 1, 0] },
            },
          },
        },
      ]),

      // Rate Limits
      UserModel.aggregate([
        {
          $facet: {
            loginLockouts: [
              {
                $match: { "security.rateLimits.login.lockUntil": { $gt: now } },
              },
              { $count: "count" },
            ],
            passwordResetLockouts: [
              {
                $match: {
                  "security.rateLimits.passwordReset.lockUntil": { $gt: now },
                },
              },
              { $count: "count" },
            ],
            verificationLockouts: [
              {
                $match: {
                  "security.rateLimits.verification.lockUntil": { $gt: now },
                },
              },
              { $count: "count" },
            ],
          },
        },
      ]),

      // Trends
      UserModel.aggregate([
        { $unwind: "$security.loginHistory" },
        { $match: { "security.loginHistory.timestamp": { $gte: last7d } } },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$security.loginHistory.timestamp",
              },
            },
            attempts: { $sum: 1 },
            failures: {
              $sum: { $cond: ["$security.loginHistory.success", 0, 1] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return this.transformSecurityData(
      summary,
      activity,
      threats,
      rateLimits,
      trends
    );
  }
  private async transformSecurityData(
    ...results: any[]
  ): Promise<SecurityDashboardData> {
    const [summary, activity, threats, rateLimits, trends] = results;
    const [recentEvents, activeSessions] = await Promise.all([
      this.getRecentSecurityEvents(),
      this.getActiveSessionsCount(),
    ]);

    return {
      summary: {
        totalUsers: summary[0]?.totalUsers[0]?.count || 0,
        activeSessions,
        lockedAccounts: summary[0]?.lockedAccounts[0]?.count || 0,
        recentThreats:
          (threats[0]?.impossibleTravel || 0) +
          (threats[0]?.suspiciousDevices || 0),
        twoFactorAdoption: summary[0]?.twoFactorAdoption[0]?.count || 0,
      },
      activity: {
        loginsLast24h: activity[0]?.logins || 0,
        failedAttempts: activity[0]?.failures || 0,
        passwordResets: activity[0]?.passwordResets || 0,
        accountVerifications: activity[0]?.verifications || 0,
      },
      threatDetection: {
        impossibleTravelCases: threats[0]?.impossibleTravel || 0,
        suspiciousDevices: threats[0]?.suspiciousDevices || 0,
        highVelocityRequests: threats[0]?.highVelocity || 0,
        botAttempts: threats[0]?.botAttempts || 0,
      },
      rateLimits: {
        loginLockouts: rateLimits[0]?.loginLockouts[0]?.count || 0,
        passwordResetLockouts:
          rateLimits[0]?.passwordResetLockouts[0]?.count || 0,
        verificationLockouts:
          rateLimits[0]?.verificationLockouts[0]?.count || 0,
      },
      trends: {
        loginAttempts: trends.map((t: any) => ({
          date: t._id,
          attempts: t.attempts,
        })),
        securityEvents: trends.map((t: any) => ({
          date: t._id,
          count: t.failures,
        })),
      },
      recentEvents,
    };
  }
  // private transformSecurityData(...results: any[]): SecurityDashboardData {
  //   const [summary, activity, threats, rateLimits, trends] = results;

  //   return {
  //     summary: {
  //       totalUsers: summary[0]?.totalUsers[0]?.count || 0,
  //       lockedAccounts: summary[0]?.lockedAccounts[0]?.count || 0,
  //       recentThreats: threats[0]?.impossibleTravel + threats[0]?.suspiciousDevices || 0,
  //       twoFactorAdoption: summary[0]?.twoFactorAdoption[0]?.count || 0
  //     },
  //     activity: {
  //       loginsLast24h: activity[0]?.logins || 0,
  //       failedAttempts: activity[0]?.failures || 0,
  //       passwordResets: activity[0]?.passwordResets || 0,
  //       accountVerifications: activity[0]?.verifications || 0
  //     },
  //     threatDetection: {
  //       impossibleTravelCases: threats[0]?.impossibleTravel || 0,
  //       suspiciousDevices: threats[0]?.suspiciousDevices || 0,
  //       highVelocityRequests: threats[0]?.highVelocity || 0,
  //       botAttempts: threats[0]?.botAttempts || 0
  //     },
  //     rateLimits: {
  //       loginLockouts: rateLimits[0]?.loginLockouts[0]?.count || 0,
  //       passwordResetLockouts: rateLimits[0]?.passwordResetLockouts[0]?.count || 0,
  //       verificationLockouts: rateLimits[0]?.verificationLockouts[0]?.count || 0
  //     },
  //     trends: {
  //       loginAttempts: trends.map((t: any) => ({
  //         date: t._id,
  //         attempts: t.attempts
  //       })),
  //       securityEvents: trends.map((t: any) => ({
  //         date: t._id,
  //         count: t.failures
  //       }))
  //     },
  //     recentEvents: await this.getRecentSecurityEvents()
  //   };
  // }

  private async getActiveSessionsCount(): Promise<number> {
    const result = await UserModel.aggregate([
      {
        $match: {
          "security.lastLogin": {
            $gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      },
      { $count: "count" },
    ]);

    return result[0]?.count || 0;
  }
  private async getRecentSecurityEvents() {
    return UserModel.aggregate([
      { $unwind: "$security.auditLog" },
      { $sort: { "security.auditLog.timestamp": -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          timestamp: "$security.auditLog.timestamp",
          type: "$security.auditLog.action",
          user: "$email",
          location: "$security.loginHistory.location",
          details: "$security.auditLog.details",
        },
      },
    ]);
  }

  // Helper methods

  private getFirstNumber(result: AggregationResult, field = "total"): number {
    return (result as any)?.[0]?.[field] || 0;
  }
  private sumStatusCounts(
    statusCounts: Array<{ _id: string; count: number }>
  ): number {
    return statusCounts.reduce((sum, { count }) => sum + count, 0);
  }

  private getStatusCount(
    statusCounts: Array<{ _id: string; count: number }>,
    status: string
  ): number {
    return statusCounts.find((s) => s._id === status)?.count || 0;
  }

  private mapToObject(
    items: Array<{ _id: string; count: number }>
  ): Record<string, number> {
    return items.reduce(
      (acc, { _id, count }) => ({ ...acc, [_id]: count }),
      {}
    );
  }

  private mapAgeGroups(
    groups: Array<{ _id: number; count: number }>
  ): Record<string, number> {
    const labels: Record<number, string> = {
      0: "0-17",
      18: "18-24",
      25: "25-34",
      35: "35-44",
      45: "55-64",
      65: "65+",
    };

    return groups.reduce(
      (acc, { _id, count }) => ({
        ...acc,
        [labels[_id] || "Unknown"]: count,
      }),
      {}
    );
  }
}
