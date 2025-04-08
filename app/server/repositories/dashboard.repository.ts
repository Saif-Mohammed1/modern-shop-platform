// src/repositories/impl/dashboard.repo.ts
import { DateTime } from "luxon";
import type { Model, Types } from "mongoose";

// import { SecurityDashboardData } from "@/app/lib/types/security.types";
import type { DashboardDataAggregate } from "@/app/lib/types/dashboardAggregate.types";
import { OrderStatus } from "@/app/lib/types/orders.types";
import { UserStatus } from "@/app/lib/types/users.types";

import CartModel from "../models/Cart.model";
import OrderModel from "../models/Order.model";
import ProductModel from "../models/Product.model";
import RefundModel from "../models/Refund.model";
import ReportModel from "../models/Report.model";
import UserModel from "../models/User.model";
import WishlistModel from "../models/Wishlist.model";

import type { BaseDashboardRepository } from "./BaseDashboardRepository";

interface AggregationResultItem<T = unknown> {
  [key: string]: T;
}

export class DashboardRepository implements BaseDashboardRepository {
  async getUserAnalytics() {
    const now = DateTime.now().toJSDate();
    const last24h = DateTime.now().minus({ days: 1 }).toJSDate();
    const last7d = DateTime.now().minus({ days: 7 }).toJSDate();
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const last8WeekDate = DateTime.now().minus({ weeks: 8 }).toJSDate();
    // const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    // const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // const lastWeekDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [result] = await UserModel.aggregate<
      DashboardDataAggregate["userAnalytics"]
    >([
      {
        $facet: {
          // User Analytics
          total: [{ $count: "total" }],
          active: [
            { $match: { status: UserStatus.ACTIVE } },
            { $count: "active" },
          ],
          recent: [
            { $match: { createdAt: { $gte: lastWeekDate } } },
            { $count: "recent" },
          ],
          demographics: [
            {
              $group: {
                _id: "$preferences.language",
                count: { $sum: 1 },
                devices: { $addToSet: "$security.loginHistory.device" },
              },
            },
            { $sort: { count: -1 } },
          ],

          // Security Analytics
          securitySummary: [
            {
              $group: {
                _id: null,
                lockedAccounts: {
                  $sum: {
                    $cond: [
                      { $gt: ["$security.rateLimits.login.lockUntil", now] },
                      1,
                      0,
                    ],
                  },
                },
                twoFactorAdoption: {
                  $sum: { $cond: ["$security.twoFactorEnabled", 1, 0] },
                },
                highRiskUsers: {
                  $sum: {
                    $cond: [
                      {
                        $or: [
                          "$security.behavioralFlags.impossibleTravel",
                          "$security.behavioralFlags.suspiciousDeviceChange",
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],

          authActivity: [
            { $unwind: "$security.loginHistory" },
            {
              $match: { "security.loginHistory.timestamp": { $gte: last24h } },
            },
            {
              $group: {
                _id: null,
                logins: {
                  $sum: { $cond: ["$security.loginHistory.success", 1, 0] },
                },
                failures: {
                  $sum: { $cond: ["$security.loginHistory.success", 0, 1] },
                },
                locations: { $addToSet: "$security.loginHistory.location" },
              },
            },
          ],

          threatAnalysis: [
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
                // botAttempts: {
                //   $sum: { $cond: ["$security.loginHistory.isBot", 1, 0] },
                // },
                botAttempts: {
                  $sum: {
                    $size: {
                      $filter: {
                        input: "$security.loginHistory",
                        as: "login",
                        cond: "$$login.isBot",
                      },
                    },
                  },
                },
              },
            },
          ],

          rateLimits: [
            {
              $group: {
                _id: null,
                loginLockouts: {
                  $sum: {
                    $cond: [
                      { $gt: ["$security.rateLimits.login.lockUntil", now] },
                      1,
                      0,
                    ],
                  },
                },
                passwordResets: {
                  $sum: "$security.rateLimits.passwordReset.attempts",
                },
              },
            },
          ],

          activityTrends: [
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
          ],
          trafficSources: [
            { $unwind: "$security.loginHistory" },
            {
              $match: {
                "security.loginHistory.timestamp": { $gte: last7d },
                "security.loginHistory.success": true,
                "security.loginHistory.isBot": false,
              },
            },
            {
              $group: {
                _id: {
                  city: "$security.loginHistory.location.city",
                  country: "$security.loginHistory.location.country",
                },
                logins: { $sum: 1 },
                uniqueUsers: { $addToSet: "$_id" },
                devices: { $addToSet: "$security.loginHistory.device" },
                browsers: { $addToSet: "$security.loginHistory.browser" },
                coordinates: {
                  $first: {
                    lat: "$security.loginHistory.location.latitude",
                    lng: "$security.loginHistory.location.longitude",
                  },
                },
                riskScore: {
                  $avg: {
                    $cond: [
                      { $gt: ["$security.rateLimits.login.attempts", 3] },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                city: "$_id.city",
                country: "$_id.country",
                logins: 1,
                uniqueUsers: { $size: "$uniqueUsers" },
                commonDevices: { $slice: ["$devices", 3] },
                commonBrowsers: { $slice: ["$browsers", 2] },
                coordinates: 1,
              },
            },
            { $sort: { logins: -1 } },
            { $limit: 20 },
          ],

          // Add device/browser breakdown
          deviceUsage: [
            { $unwind: "$security.loginHistory" },
            {
              $group: {
                _id: {
                  device: "$security.loginHistory.device",
                  os: "$security.loginHistory.os",
                  // browser: "$security.loginHistory.browser",
                },
                count: { $sum: 1 },
                cities: { $addToSet: "$security.loginHistory.location.city" },
              },
            },
            {
              $project: {
                _id: 0, // 👈 This removes the _id from the output
                device: "$_id.device",
                os: "$_id.os",
                // browser: "$_id.browser",
                count: 1,
                citiesCoverage: { $size: "$cities" },
              },
            },
            { $sort: { count: -1 } },
          ],
          weeklyGrowth: [
            {
              $match: {
                "security.loginHistory.timestamp": {
                  $gte: last8WeekDate,
                },
              },
            },
            {
              $unwind: "$security.loginHistory",
            },
            {
              $group: {
                _id: {
                  year: {
                    $isoWeekYear: "$security.loginHistory.timestamp",
                  },
                  week: {
                    $isoWeek: "$security.loginHistory.timestamp",
                  },
                },
                currentWeekLogins: { $sum: 1 },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.week": 1 },
            },
            {
              $group: {
                _id: null,
                weeks: {
                  $push: {
                    week: "$_id.week",
                    year: "$_id.year",
                    logins: "$currentWeekLogins",
                  },
                },
              },
            },
            {
              $project: {
                weeklyGrowth: {
                  $map: {
                    input: "$weeks",
                    as: "currentWeek",
                    in: {
                      week: "$$currentWeek.week",
                      year: "$$currentWeek.year",
                      currentLogins: "$$currentWeek.logins",
                      previousLogins: {
                        $let: {
                          vars: {
                            prevIndex: {
                              $subtract: [
                                { $indexOfArray: ["$weeks", "$$currentWeek"] },
                                1,
                              ],
                            },
                          },
                          in: {
                            $cond: [
                              { $lt: ["$$prevIndex", 0] },
                              0,
                              {
                                $arrayElemAt: ["$weeks.logins", "$$prevIndex"],
                              },
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$weeklyGrowth" },
            {
              $project: {
                _id: 0,
                label: {
                  $concat: [
                    "Week ",
                    { $toString: "$weeklyGrowth.week" },
                    " ",
                    { $toString: "$weeklyGrowth.year" },
                  ],
                },
                currentLogins: "$weeklyGrowth.currentLogins",
                previousLogins: "$weeklyGrowth.previousLogins",
                growthPercentage: {
                  $cond: [
                    {
                      $eq: ["$weeklyGrowth.previousLogins", 0],
                    },
                    0,
                    {
                      $multiply: [
                        {
                          $divide: [
                            {
                              $subtract: [
                                "$weeklyGrowth.currentLogins",
                                "$weeklyGrowth.previousLogins",
                              ],
                            },
                            "$weeklyGrowth.previousLogins",
                          ],
                        },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
            {
              $sort: {
                "weeklyGrowth.year": 1,
                "weeklyGrowth.week": 1,
              },
            },
          ],
        },
      },
    ]);

    const defaultDistribution: Record<string, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    };

    return {
      totalUsers: this.getFirstNumber(result.total ?? [], "total"),
      activeUsers: this.getFirstNumber(result.active ?? [], "active"),
      recentSignups: this.getFirstNumber(result.recent ?? [], "recent"),
      languageDistribution: result.demographics
        ? this.mapToObject(result.demographics)
        : defaultDistribution,
      geographicalInsights: {
        topLocations: await Promise.all(
          (result.trafficSources ?? []).map(async (city) => ({
            ...city,
            growthPercentage: await this.calculateCityGrowth(
              city.city,
              city.country
            ),
          }))
        ),
        deviceDistribution: result.deviceUsage ?? [],
        totalCities: new Set(
          (result.trafficSources ?? []).flatMap(
            (t) => `${t.city}, ${t.country}`
          )
        ).size,
      },
      security: {
        twoFactorAdoption: this.getFirstNumber(
          result.securitySummary ?? [],
          "twoFactorAdoption"
        ),
        lockedAccounts: this.getFirstNumber(
          result.securitySummary ?? [],
          "lockedAccounts"
        ),
        highRiskUsers: this.getFirstNumber(
          result.securitySummary ?? [],
          "highRiskUsers"
        ),
        authActivity: {
          loginsLast24h: this.getFirstNumber(
            result.authActivity ?? [],
            "logins"
          ),
          failedAttempts: this.getFirstNumber(
            result.authActivity ?? [],
            "failures"
          ),
          uniqueLocations: result.authActivity?.[0]?.locations?.length ?? 0,
        },
        threats: {
          impossibleTravel: this.getFirstNumber(
            result.threatAnalysis ?? [],
            "impossibleTravel"
          ),
          suspiciousDevices: this.getFirstNumber(
            result.threatAnalysis ?? [],
            "suspiciousDevices"
          ),
          botAttempts: this.getFirstNumber(
            result.threatAnalysis ?? [],
            "botAttempts"
          ),
        },
        rateLimits: {
          activeLockouts: this.getFirstNumber(
            result.rateLimits ?? [],
            "loginLockouts"
          ),
          passwordResetAttempts: this.getFirstNumber(
            result.rateLimits ?? [],
            "passwordResets"
          ),
        },
        trends: (result.activityTrends ?? [])?.map((t) => ({
          date: t._id,
          attempts: t.attempts,
          successRate:
            t.attempts > 0
              ? `${(((t.attempts - (t.failures ?? 0)) / t.attempts) * 100).toFixed(1)}%`
              : "0%",
        })),
      },
      deviceDiversity: {
        totalDevices: [
          ...new Set(
            (result.demographics ?? []).flatMap((d) => d.devices ?? [])
          ),
        ].length,
      },
      weeklyGrowth: (result.weeklyGrowth ?? []).map((wg) => ({
        label: wg.label,
        currentLogins: wg.currentLogins,
        previousLogins: wg.previousLogins,
        growthPercentage: `${wg.growthPercentage.toFixed(1)}%`,
      })),
    };
  }
  // Product Analytics
  async getProductAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const last30d = DateTime.now().minus({ days: 30 }).toJSDate();

    const [result] = await ProductModel.aggregate<
      DashboardDataAggregate["productAnalytics"]
    >([
      {
        $facet: {
          // Core Inventory Metrics
          stockInfo: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                outOfStock: {
                  $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] },
                },
                lowStock: { $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] } },
                active: { $sum: { $cond: ["$active", 1, 0] } },
                totalInventoryValue: {
                  $sum: { $multiply: ["$price", "$stock"] },
                },
                totalReservedValue: {
                  $sum: { $multiply: ["$price", "$reserved"] },
                },
              },
            },
          ],

          // Sales Performance
          salesMetrics: [
            {
              $group: {
                _id: null,
                totalSold: { $sum: "$sold" },
                totalRevenue: { $sum: { $multiply: ["$price", "$sold"] } },
                avgSalesPerProduct: { $avg: "$sold" },
                topSelling: { $max: "$sold" },
              },
            },
          ],

          // Discount Analysis
          discountAnalysis: [
            {
              $match: {
                discount: { $gt: 0 },
                discountExpire: { $exists: true },
              },
            },
            {
              $group: {
                _id: null,
                activeDiscounts: { $sum: 1 },
                expiringSoon: {
                  $sum: {
                    $cond: [{ $gt: ["$discountExpire", new Date()] }, 1, 0],
                  },
                },
                avgDiscount: { $avg: "$discount" },
              },
            },
          ],

          // Product Engagement
          engagementMetrics: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: "$ratingsAverage" },
                totalReviews: { $sum: "$ratingsQuantity" },
                recentlyReviewed: {
                  $sum: {
                    $cond: [{ $gte: ["$updatedAt", last30d] }, 1, 0],
                  },
                },
              },
            },
          ],

          // Category Insights
          categoryDistribution: [
            {
              $group: {
                _id: "$category",
                count: { $sum: 1 },
                totalSales: { $sum: "$sold" },
                avgPrice: { $avg: "$price" },
                avgStock: { $avg: "$stock" },
              },
            },
          ],

          // Recent Activity
          recentActivity: [
            {
              $match: {
                $or: [
                  { createdAt: { $gte: lastWeekDate } },
                  { updatedAt: { $gte: lastWeekDate } },
                ],
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                type: {
                  $cond: [
                    { $gte: ["$createdAt", lastWeekDate] },
                    "New Product",
                    "Updated Product",
                  ],
                },
                modifiedBy: "$lastModifiedBy",
              },
            },
          ],

          // Shipping Analytics
          shippingMetrics: [
            {
              $group: {
                _id: null,
                avgWeight: { $avg: "$shippingInfo.weight" },
                totalVolume: {
                  $sum: {
                    $multiply: [
                      "$shippingInfo.dimensions.length",
                      "$shippingInfo.dimensions.width",
                      "$shippingInfo.dimensions.height",
                    ],
                  },
                },
              },
            },
          ],
          riskAnalysis: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $lt: ["$stock", "$reserved"] },
                    { $gt: ["$reserved", { $multiply: ["$stock", 0.5] }] },
                  ],
                },
              },
            },
            { $count: "riskyProducts" },
          ],
          weeklyGrowth: [
            {
              $match: {
                createdAt: {
                  $gte: DateTime.now().minus({ weeks: 8 }).toJSDate(),
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $isoWeekYear: "$createdAt" },
                  week: { $isoWeek: "$createdAt" },
                },
                currentWeekSales: { $sum: "$sold" },
                currentWeekRevenue: {
                  $sum: { $multiply: ["$price", "$sold"] },
                },
              },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            {
              $group: {
                _id: null,
                weeks: {
                  $push: {
                    week: "$_id.week",
                    year: "$_id.year",
                    sales: "$currentWeekSales",
                    revenue: "$currentWeekRevenue",
                  },
                },
              },
            },
            {
              $project: {
                weeklyGrowth: {
                  $map: {
                    input: "$weeks",
                    as: "week",
                    in: {
                      week: "$$week.week",
                      year: "$$week.year",
                      currentSales: "$$week.sales",
                      previousSales: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.sales",
                              {
                                $subtract: [
                                  { $indexOfArray: ["$weeks", "$$week"] },
                                  1,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                      currentRevenue: "$$week.revenue",
                      previousRevenue: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.revenue",
                              {
                                $subtract: [
                                  { $indexOfArray: ["$weeks", "$$week"] },
                                  1,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$weeklyGrowth" },
            { $replaceRoot: { newRoot: "$weeklyGrowth" } },
            {
              $project: {
                _id: 0,
                label: {
                  $concat: [
                    "Week ",
                    { $toString: "$week" },
                    " ",
                    { $toString: "$year" },
                  ],
                },
                salesGrowth: {
                  $cond: [
                    { $eq: ["$previousSales", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentSales",
                                    "$previousSales",
                                  ],
                                },
                                "$previousSales",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                revenueGrowth: {
                  $cond: [
                    { $eq: ["$previousRevenue", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentRevenue",
                                    "$previousRevenue",
                                  ],
                                },
                                "$previousRevenue",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                currentSales: 1,
                currentRevenue: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      weeklyGrowth: (result.weeklyGrowth ?? []).map((wg) => ({
        ...wg,
        salesGrowth: Number(wg.salesGrowth.toFixed(1)),
        revenueGrowth: Number(wg.revenueGrowth.toFixed(1)),
      })),

      inventory: {
        total: this.getFirstNumber(result.stockInfo, "total"),
        outOfStock: this.getFirstNumber(result.stockInfo, "outOfStock"),
        lowStock: this.getFirstNumber(result.stockInfo, "lowStock"),
        active: this.getFirstNumber(result.stockInfo, "active"),
        totalValue: this.getFirstNumber(
          result.stockInfo,
          "totalInventoryValue"
        ),
        reservedValue: this.getFirstNumber(
          result.stockInfo,
          "totalReservedValue"
        ),
      },

      sales: {
        totalSold: this.getFirstNumber(result.salesMetrics, "totalSold"),
        totalRevenue: this.getFirstNumber(result.salesMetrics, "totalRevenue"),
        avgSales: this.getFirstNumber(
          result.salesMetrics,
          "avgSalesPerProduct"
        ),
        topSelling: this.getFirstNumber(result.salesMetrics, "topSelling"),
      },

      discounts: {
        active: this.getFirstNumber(result.discountAnalysis, "activeDiscounts"),
        expiringSoon: this.getFirstNumber(
          result.discountAnalysis,
          "expiringSoon"
        ),
        avgDiscount: this.getFirstNumber(
          result.discountAnalysis,
          "avgDiscount"
        ),
      },

      engagement: {
        avgRating: this.getFirstNumber(result.engagementMetrics, "avgRating"),
        totalReviews: this.getFirstNumber(
          result.engagementMetrics,
          "totalReviews"
        ),
        recentReviews: this.getFirstNumber(
          result.engagementMetrics,
          "recentlyReviewed"
        ),
      },

      categories: (result.categoryDistribution ?? []).map((c) => ({
        name: c._id,
        count: c.count,
        sales: c.totalSales,
        avgPrice: c.avgPrice,
        avgStock: c.avgStock,
      })),

      recentChanges: result.recentActivity ?? [],

      shipping: {
        avgWeight: this.getFirstNumber(result.shippingMetrics, "avgWeight"),
        totalVolume: this.getFirstNumber(result.shippingMetrics, "totalVolume"),
      },

      risk: {
        stockConflicts: this.getFirstNumber(
          result.riskAnalysis,
          "riskyProducts"
        ),
      },
    };
  }

  async getOrderAnalytics() {
    const now = DateTime.now();
    const periods = {
      dailyStart: now.startOf("day").toJSDate(),
      weeklyStart: now.minus({ weeks: 1 }).toJSDate(),
      monthlyStart: now.minus({ months: 1 }).toJSDate(),
      yearlyStart: now.minus({ years: 1 }).toJSDate(),
    };

    const [result] = await OrderModel.aggregate<
      DashboardDataAggregate["orderAnalytics"]
    >([
      {
        $facet: {
          // Core Metrics
          summary: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                completedOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$status", OrderStatus.Completed] }, 1, 0],
                  },
                },
                avgOrderValue: { $avg: "$total" },
                totalRevenue: { $sum: "$total" },
                avgItemsPerOrder: { $avg: { $size: "$items" } },
              },
            },
          ],

          // Financial Health
          financials: [
            {
              $match: { status: OrderStatus.Completed },
            },
            {
              $group: {
                _id: null,
                netRevenue: { $sum: "$total" },
                totalTax: { $sum: "$tax" },
                avgProcessingCost: {
                  $avg: {
                    $add: [
                      "$shippingCost",
                      { $multiply: ["$total", 0.03] }, // Payment processing fee estimate
                    ],
                  },
                },
                refunds: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", OrderStatus.Cancelled] },
                      "$total",
                      0,
                    ],
                  },
                },
              },
            },
          ],

          // Customer Behavior
          customerInsights: [
            {
              $group: {
                _id: "$userId",
                orderCount: { $sum: 1 },
                totalSpent: { $sum: "$total" },
              },
            },
            {
              $group: {
                _id: null,
                repeatCustomers: {
                  $sum: { $cond: [{ $gt: ["$orderCount", 1] }, 1, 0] },
                },
                avgLifetimeValue: { $avg: "$totalSpent" },
                topSpender: { $max: "$totalSpent" },
              },
            },
          ],

          // Product Performance
          productAnalytics: [
            {
              $unwind: "$items",
            },
            {
              $group: {
                _id: "$items.productId",
                productName: { $first: "$items.name" },
                totalSold: { $sum: "$items.quantity" },
                totalRevenue: {
                  $sum: { $multiply: ["$items.quantity", "$items.finalPrice"] },
                },
              },
            },
            {
              $sort: { totalRevenue: -1 },
            },
            {
              $limit: 10,
            },
          ],

          // Temporal Analysis
          timeSeries: [
            {
              $match: { createdAt: { $gte: periods.yearlyStart } },
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                count: { $sum: 1 },
                revenue: { $sum: "$total" },
                avgOrderValue: { $avg: "$total" },
              },
            },
            {
              $sort: { "_id.year": 1, "_id.month": 1 },
            },
          ],

          // Geo Distribution
          geographicInsights: [
            {
              $group: {
                _id: "$shippingAddress.city",
                state: { $first: "$shippingAddress.state" },
                country: { $first: "$shippingAddress.country" },
                orderCount: { $sum: 1 },
                totalRevenue: { $sum: "$total" },
              },
            },
            {
              $sort: { totalRevenue: -1 },
            },
            {
              $limit: 15,
            },
          ],

          // Payment Analysis
          paymentMethods: [
            {
              $group: {
                _id: "$payment.method",
                count: { $sum: 1 },
                totalAmount: { $sum: "$total" },
                avgAmount: { $avg: "$total" },
              },
            },
          ],

          // Operational Metrics
          fulfillment: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 },
                avgFulfillmentTime: {
                  $avg: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$updatedAt",
                      unit: "hour",
                    },
                  },
                },
              },
            },
          ],
          weeklyComparison: [
            {
              $match: {
                createdAt: {
                  $gte: DateTime.now().minus({ weeks: 2 }).toJSDate(),
                },
                status: OrderStatus.Completed,
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: {
                    format: "%Y-%U",
                    date: "$createdAt",
                  },
                },
                currentWeek: {
                  $sum: {
                    $cond: [
                      {
                        $gte: [
                          "$createdAt",
                          DateTime.now().startOf("week").toJSDate(),
                        ],
                      },
                      "$total",
                      0,
                    ],
                  },
                },
                previousWeek: {
                  $sum: {
                    $cond: [
                      {
                        $lt: [
                          "$createdAt",
                          DateTime.now().startOf("week").toJSDate(),
                        ],
                      },
                      "$total",
                      0,
                    ],
                  },
                },
              },
            },
            {
              $project: {
                week: "$_id",
                currentWeek: 1,
                previousWeek: 1,
                growthRate: {
                  $cond: [
                    { $eq: ["$previousWeek", 0] },
                    { $cond: [{ $gt: ["$currentWeek", 0] }, 100, 0] },
                    {
                      $multiply: [
                        {
                          $divide: [
                            { $subtract: ["$currentWeek", "$previousWeek"] },
                            "$previousWeek",
                          ],
                        },
                        100,
                      ],
                    },
                  ],
                },
              },
            },
          ],

          recentOrders: [
            { $sort: { createdAt: -1 } }, // Separate stage
            { $limit: 5 }, // Separate stage
          ],
          weeklyGrowth: [
            {
              $match: {
                createdAt: {
                  $gte: DateTime.now().minus({ weeks: 8 }).toJSDate(),
                },
              },
            },
            {
              $group: {
                _id: {
                  year: { $isoWeekYear: "$createdAt" },
                  week: { $isoWeek: "$createdAt" },
                },
                currentWeekOrders: { $sum: 1 },
                currentWeekRevenue: { $sum: "$total" },
              },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            {
              $group: {
                _id: null,
                weeks: {
                  $push: {
                    week: "$_id.week",
                    year: "$_id.year",
                    orders: "$currentWeekOrders",
                    revenue: "$currentWeekRevenue",
                  },
                },
              },
            },
            {
              $project: {
                weeklyGrowth: {
                  $map: {
                    input: "$weeks",
                    as: "week",
                    in: {
                      week: "$$week.week",
                      year: "$$week.year",
                      currentOrders: "$$week.orders",
                      previousOrders: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.orders",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                      currentRevenue: "$$week.revenue",
                      previousRevenue: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.revenue",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$weeklyGrowth" },
            { $replaceRoot: { newRoot: "$weeklyGrowth" } },
            {
              $project: {
                _id: 0,
                label: {
                  $concat: [
                    "Week ",
                    { $toString: "$week" },
                    " ",
                    { $toString: "$year" },
                  ],
                },
                orderGrowth: {
                  $cond: [
                    { $eq: ["$previousOrders", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentOrders",
                                    "$previousOrders",
                                  ],
                                },
                                "$previousOrders",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                revenueGrowth: {
                  $cond: [
                    { $eq: ["$previousRevenue", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentRevenue",
                                    "$previousRevenue",
                                  ],
                                },
                                "$previousRevenue",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                currentOrders: 1,
                currentRevenue: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      weeklyGrowth: (result.weeklyGrowth ?? []).map((wg) => ({
        ...wg,
        orderGrowth: Number(wg.orderGrowth.toFixed(1)),
        revenueGrowth: Number(wg.revenueGrowth.toFixed(1)),
      })),

      summary: {
        totalOrders: this.getFirstNumber(result.summary, "totalOrders"),
        completedOrders: this.getFirstNumber(result.summary, "completedOrders"),
        avgOrderValue: this.getFirstNumber(result.summary, "avgOrderValue"),
        totalRevenue: this.getFirstNumber(result.summary, "totalRevenue"),
        avgItemsPerOrder: this.getFirstNumber(
          result.summary,
          "avgItemsPerOrder"
        ),
      },

      financialHealth: {
        netRevenue: this.getFirstNumber(result.financials, "netRevenue"),
        totalTax: this.getFirstNumber(result.financials, "totalTax"),
        processingCosts: this.getFirstNumber(
          result.financials,
          "avgProcessingCost"
        ),
        netProfitMargin: {
          monthly: this.calculateProfitMargin(
            this.getFirstNumber(result.financials, "netRevenue"),
            this.getFirstNumber(result.financials, "avgProcessingCost")
          ),
        },
        refundRate: this.calculateRefundRate(
          this.getFirstNumber(result.financials, "refunds"),
          this.getFirstNumber(result.summary, "totalRevenue")
        ),
        weeklyGrowth: this.getFirstNumber(
          result.weeklyComparison,
          "growthRate"
        ),
      },

      customerBehavior: {
        repeatRate: this.calculateRepeatRate(
          this.getFirstNumber(result.customerInsights, "repeatCustomers"),
          this.getFirstNumber(result.summary, "totalOrders")
        ),
        avgLTV: this.getFirstNumber(
          result.customerInsights,
          "avgLifetimeValue"
        ),
        topSpender: this.getFirstNumber(result.customerInsights, "topSpender"),
      },

      topProducts: (result.productAnalytics ?? []).map((p) => ({
        productId: p._id,
        name: p.productName,
        unitsSold: p.totalSold,
        revenue: p.totalRevenue,
      })),

      trends: {
        monthly: (result.timeSeries ?? []).map((t) => ({
          period: `${t._id.year}-${String(t._id.month).padStart(2, "0")}`,
          orders: t.count,
          revenue: t.revenue,
          aov: t.avgOrderValue,
        })),
        yoyGrowth: this.calculateGrowthRate(result.timeSeries ?? []),
        weeklyBreakdown: (result.weeklyComparison ?? []).map((w) => ({
          week: w.week,
          current: w.currentWeek,
          previous: w.previousWeek,
          growth: w.growthRate,
        })),
      },

      fulfillment: {
        statusDistribution: (result.fulfillment ?? []).reduce(
          (acc, curr) => ({
            ...acc,
            [curr._id]: {
              count: curr.count,
              avgHours: curr.avgFulfillmentTime,
            },
          }),
          {} as Record<string, { count: number; avgHours: number }>
        ),
        slaCompliance: this.calculateSLACompliance(result.fulfillment ?? []),
      },

      paymentMethods: (result.paymentMethods ?? []).map((m) => ({
        method: m._id,
        usageCount: m.count,
        totalProcessed: m.totalAmount,
      })),

      topLocations: (result.geographicInsights ?? []).map((l) => ({
        city: l._id,
        state: l.state,
        country: l.country,
        orderCount: l.orderCount,
        revenue: l.totalRevenue,
      })),

      recentOrders: result.recentOrders ?? [],
    };
  }

  // Report Analytics
  async getReportAnalytics() {
    const lastWeekDate = DateTime.now().minus({ weeks: 1 }).toJSDate();
    const last8WeeksDate = DateTime.now().minus({ weeks: 8 }).toJSDate();
    const [result] = await ReportModel.aggregate<
      DashboardDataAggregate["reportAnalytics"]
    >([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                resolved: {
                  $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
                },
                avgResolutionHours: {
                  $avg: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$updatedAt",
                      unit: "hour",
                    },
                  },
                },
              },
            },
          ],
          statusDistribution: [
            { $group: { _id: "$status", count: { $sum: 1 } } },
          ],
          recentReports: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                issue: 1,
                status: 1,
                product: "$product.name",
                reporter: "$user.name",
                createdAt: 1,
              },
            },
          ],
          trendAnalysis: [
            { $match: { createdAt: { $gte: lastWeekDate } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          commonIssues: [
            {
              $group: {
                _id: "$issue",
                count: { $sum: 1 },
                products: { $addToSet: "$product.name" },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
          weeklyGrowth: [
            {
              $match: {
                createdAt: { $gte: last8WeeksDate },
                status: "resolved",
              },
            },
            {
              $group: {
                _id: {
                  year: { $isoWeekYear: "$createdAt" },
                  week: { $isoWeek: "$createdAt" },
                },
                resolvedCount: { $sum: 1 },
                totalCount: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            {
              $group: {
                _id: null,
                weeks: {
                  $push: {
                    week: "$_id.week",
                    year: "$_id.year",
                    resolved: "$resolvedCount",
                    total: "$totalCount",
                  },
                },
              },
            },
            {
              $project: {
                weeklyGrowth: {
                  $map: {
                    input: "$weeks",
                    as: "week",
                    in: {
                      week: "$$week.week",
                      year: "$$week.year",
                      currentResolved: "$$week.resolved",
                      previousResolved: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.resolved",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                      currentTotal: "$$week.total",
                      previousTotal: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.total",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$weeklyGrowth" },
            { $replaceRoot: { newRoot: "$weeklyGrowth" } },
            {
              $project: {
                label: {
                  $concat: [
                    "Week ",
                    { $toString: "$week" },
                    " ",
                    { $toString: "$year" },
                  ],
                },
                resolutionGrowth: {
                  $cond: [
                    { $eq: ["$previousResolved", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentResolved",
                                    "$previousResolved",
                                  ],
                                },
                                "$previousResolved",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                reportGrowth: {
                  $cond: [
                    { $eq: ["$previousTotal", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentTotal",
                                    "$previousTotal",
                                  ],
                                },
                                "$previousTotal",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                currentResolved: 1,
                currentTotal: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result.summary, "total"),
      resolved: this.getFirstNumber(result.summary, "resolved"),
      resolutionRate: this.calculatePercentage(
        this.getFirstNumber(result.summary, "resolved"),
        this.getFirstNumber(result.summary, "total")
      ),
      avgResolutionTime: this.getFirstNumber(
        result.summary,
        "avgResolutionHours"
      ),
      statusBreakdown: this.mapToObject(result.statusDistribution ?? []),
      trendingIssues: (result.commonIssues ?? []).map((i) => ({
        issue: i._id,
        count: i.count,
        affectedProducts: i.products,
      })),
      recentReports: result.recentReports ?? [],
      dailyTrend: (result.trendAnalysis ?? []).map((t) => ({
        date: t._id,
        reports: t.count,
      })),
      weeklyTrends: (result.weeklyGrowth ?? []).map((week) => ({
        ...week,
        resolutionGrowth: `${week.resolutionGrowth.toFixed(1)}%`,
        reportGrowth: `${week.reportGrowth.toFixed(1)}%`,
      })),
    };
  }

  // Refund Analytics
  async getRefundAnalytics() {
    const lastMonthDate = DateTime.now().minus({ months: 1 }).toJSDate();
    const last8WeeksDate = DateTime.now().minus({ weeks: 8 }).toJSDate();
    const [result] = await RefundModel.aggregate<
      DashboardDataAggregate["refundAnalytics"]
    >([
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
                approved: {
                  $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
                },
                avgProcessingHours: {
                  $avg: {
                    $dateDiff: {
                      startDate: "$createdAt",
                      endDate: "$updatedAt",
                      unit: "hour",
                    },
                  },
                },
              },
            },
          ],
          statusTrend: [
            { $match: { createdAt: { $gte: lastMonthDate } } },
            {
              $group: {
                _id: {
                  week: { $week: "$createdAt" },
                  status: "$status",
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.week": 1 } },
          ],
          recentRefunds: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $project: {
                _id: 1,
                amount: 1,
                status: 1,
                user: "$user.name",
                createdAt: 1,
                invoiceId: 1,
              },
            },
          ],
          commonReasons: [
            {
              $group: {
                _id: "$reason",
                count: { $sum: 1 },
                totalAmount: { $sum: "$amount" },
              },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ], // Add to refund analytics
          highRiskRefunds: [
            { $match: { amount: { $gt: 500 }, status: "pending" } },
            { $count: "count" },
          ], // Add to refund aggregation
          financialImpact: [
            {
              $group: {
                _id: null,
                totalRefunded: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "approved"] }, "$amount", 0],
                  },
                },
                avgRefund: { $avg: "$amount" },
                maxRefund: { $max: "$amount" },
              },
            },
          ],
          weeklyGrowth: [
            {
              $match: {
                createdAt: { $gte: last8WeeksDate },
                status: "approved",
              },
            },
            {
              $group: {
                _id: {
                  year: { $isoWeekYear: "$createdAt" },
                  week: { $isoWeek: "$createdAt" },
                },
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } },
            {
              $group: {
                _id: null,
                weeks: {
                  $push: {
                    week: "$_id.week",
                    year: "$_id.year",
                    totalAmount: "$totalAmount",
                    count: "$count",
                  },
                },
              },
            },
            {
              $project: {
                weeklyGrowth: {
                  $map: {
                    input: "$weeks",
                    as: "week",
                    in: {
                      week: "$$week.week",
                      year: "$$week.year",
                      currentAmount: "$$week.totalAmount",
                      previousAmount: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.totalAmount",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                      currentCount: "$$week.count",
                      previousCount: {
                        $ifNull: [
                          {
                            $arrayElemAt: [
                              "$weeks.count",
                              {
                                $max: [
                                  {
                                    $subtract: [
                                      { $indexOfArray: ["$weeks", "$$week"] },
                                      1,
                                    ],
                                  },
                                  0,
                                ],
                              },
                            ],
                          },
                          0,
                        ],
                      },
                    },
                  },
                },
              },
            },
            { $unwind: "$weeklyGrowth" },
            { $replaceRoot: { newRoot: "$weeklyGrowth" } },
            {
              $project: {
                label: {
                  $concat: [
                    "Week ",
                    { $toString: "$week" },
                    " ",
                    { $toString: "$year" },
                  ],
                },
                amountGrowth: {
                  $cond: [
                    { $eq: ["$previousAmount", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentAmount",
                                    "$previousAmount",
                                  ],
                                },
                                "$previousAmount",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                countGrowth: {
                  $cond: [
                    { $eq: ["$previousCount", 0] },
                    0,
                    {
                      $round: [
                        {
                          $multiply: [
                            {
                              $divide: [
                                {
                                  $subtract: [
                                    "$currentCount",
                                    "$previousCount",
                                  ],
                                },
                                "$previousCount",
                              ],
                            },
                            100,
                          ],
                        },
                        1,
                      ],
                    },
                  ],
                },
                currentAmount: 1,
                currentCount: 1,
              },
            },
          ],
        },
      },
    ]);

    return {
      total: this.getFirstNumber(result.summary, "total"),
      totalAmount: this.getFirstNumber(result.summary, "totalAmount"),
      approvalRate:
        (this.getFirstNumber(result.summary, "approved") /
          this.getFirstNumber(result.summary, "total")) *
          100 || 0,
      avgProcessingTime: this.getFirstNumber(
        result.summary,
        "avgProcessingHours"
      ),
      weeklyTrend: result.statusTrend.reduce(
        (acc: Record<string, Record<string, number>>, curr) => {
          const week = `Week ${curr._id.week}`;
          if (!acc[week]) {
            acc[week] = {};
          }
          acc[week][curr._id.status] = curr.count;
          return acc;
        },
        {}
      ),
      commonReasons: result.commonReasons.map((r) => ({
        reason: r._id,
        frequency: r.count,
        financialImpact: r.totalAmount,
      })),
      recentRefunds: result.recentRefunds,
      weeklyGrowth: result.weeklyGrowth.map((wg) => ({
        ...wg,
        amountGrowth: `${wg.amountGrowth.toFixed(1)}%`,
        countGrowth: `${wg.countGrowth.toFixed(1)}%`,
      })),
      highRiskRefunds: this.getFirstNumber(result.highRiskRefunds, "count"),
      financialImpact: {
        totalRefunded: this.getFirstNumber(
          result.financialImpact,
          "totalRefunded"
        ),
        avgRefund: this.getFirstNumber(result.financialImpact, "avgRefund"),
        maxRefund: this.getFirstNumber(result.financialImpact, "maxRefund"),
      },
    };
  }
  async getUserInterestAnalytics() {
    // const lastMonth = DateTime.now().minus({ months: 1 }).toJSDate();

    const [cartInsights, wishlistInsights, combinedData] = await Promise.all([
      CartModel.aggregate<
        DashboardDataAggregate["userInterestAnalytics"]["cart"]
      >([
        // { $match: { expiresAt: { $gt: new Date() } } }, // Only active carts
        // { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalItems: { $sum: "$quantity" },
            uniqueUsers: { $addToSet: "$userId" },
            avgPrice: { $avg: "$product.price" },
            maxPrice: { $max: "$product.price" },
            minPrice: { $min: "$product.price" },
          },
        },
        { $sort: { totalItems: -1 } },
      ]),

      WishlistModel.aggregate<
        DashboardDataAggregate["userInterestAnalytics"]["wishlist"]
      >([
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product.category",
            totalItems: { $sum: 1 },
            uniqueUsers: { $addToSet: "$userId" },
            avgPrice: { $avg: "$product.price" },
            priceSensitivity: {
              $avg: {
                $cond: [{ $gt: ["$product.discount", 0] }, 1, 0],
              },
            },
          },
        },
        { $sort: { totalItems: -1 } },
      ]),

      CartModel.aggregate<
        DashboardDataAggregate["userInterestAnalytics"]["CombinedData"]
      >([
        // { $match: { createdAt: { $gte: lastMonth } } },
        // { $unwind: "$items" },
        {
          $group: {
            _id: {
              product: "$productId",
              week: { $week: "$createdAt" },
            },
            cartAdds: { $sum: 1 },
            purchases: {
              $sum: {
                $cond: [{ $ifNull: ["$purchasedAt", false] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            productId: "$_id.product",
            week: "$_id.week",
            cartAdds: 1,
            purchases: 1,
            conversionRate: {
              $cond: [
                { $eq: ["$cartAdds", 0] },
                0,
                { $divide: ["$purchases", "$cartAdds"] },
              ],
            },
          },
        },
      ]),
    ]);

    return {
      categoryAnalysis: {
        cart: cartInsights.map((c) => ({
          category: c._id,
          totalItems: c.totalItems,
          uniqueUsers: c.uniqueUsers.length,
          priceRange: { min: c.minPrice, max: c.maxPrice, avg: c.avgPrice },
        })),
        wishlist: wishlistInsights.map((w) => ({
          category: w._id,
          totalItems: w.totalItems,
          uniqueUsers: w.uniqueUsers.length,
          priceSensitivity: w.priceSensitivity,
        })),
      },
      conversionMetrics: combinedData.reduce(
        (
          acc: Array<{
            productId: Types.ObjectId;
            weeks: Array<{
              week: number;
              cartAdds: number;
              purchases: number;
              conversionRate: number;
            }>;
          }>,
          curr
        ) => {
          const existing = acc.find((i) => i.productId.equals(curr.productId));
          if (existing) {
            existing.weeks.push({
              week: curr.week,
              cartAdds: curr.cartAdds,
              purchases: curr.purchases,
              conversionRate: curr.conversionRate,
            });
          } else {
            acc.push({
              productId: curr.productId,
              weeks: [
                {
                  week: curr.week,
                  cartAdds: curr.cartAdds,
                  purchases: curr.purchases,
                  conversionRate: curr.conversionRate,
                },
              ],
            });
          }
          return acc;
        },
        []
      ),
      highInterestProducts: {
        frequentlyCartAdded: await this.getTopProducts(CartModel, 10),
        frequentlyWishlisted: await this.getTopProducts(WishlistModel, 10),
        abandonedItems: await this.getAbandonedProducts(),
      },
    };
  }

  private async getTopProducts(model: Model<any>, limit: number) {
    return model.aggregate([
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          category: "$product.category",
          price: "$product.price",
          count: 1,
        },
      },
    ]);
  }

  private async getAbandonedProducts() {
    return CartModel.aggregate([
      // { $match: { expiresAt: { $lt: new Date() } } },
      // { $unwind: "$items" },
      { $group: { _id: "$productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$_id",
          name: "$product.name",
          stock: "$product.stock",
          count: 1,
        },
      },
    ]);
  }
  private getFirstNumber(
    result: AggregationResultItem[] = [],
    field: string = "total"
  ): number {
    return (result[0]?.[field] as number) ?? 0;
  }

  private mapToObject(
    items: Array<{ _id: string; count: number }>
  ): Record<string, number> {
    return (
      items?.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}) ??
      {}
    );
  }
  private calculateProfitMargin(revenue: number, costs: number): number {
    return revenue > 0 ? ((revenue - costs) / revenue) * 100 : 0;
  }

  // private calculateGrowthRate(
  //   timeSeries: DashboardDataAggregate["orderAnalytics"]["timeSeries"][]
  // ): number {
  //   if (timeSeries.length < 2) {
  //     return 0;
  //   }

  //   const current = timeSeries[timeSeries.length - 1]?.revenue || 0;
  //   const previous = timeSeries[timeSeries.length - 2]?.revenue || 0;

  //   return previous !== 0
  //     ? ((current - previous) / previous) * 100
  //     : current > 0
  //       ? 100
  //       : 0;
  // }
  private calculateGrowthRate(
    timeSeries: DashboardDataAggregate["orderAnalytics"]["timeSeries"]
  ): number {
    // Validate input structure and length
    if (!Array.isArray(timeSeries) || timeSeries.length < 2) {
      return 0;
    }

    // Safe value extraction with type checking
    const getRevenue = (item: {
      _id: { year: number; month: number };
      count: number;
      revenue: number;
      avgOrderValue: number;
    }) => (typeof item.revenue === "number" ? item.revenue : 0);

    const current = getRevenue(timeSeries[timeSeries.length - 1]);
    const previous = getRevenue(timeSeries[timeSeries.length - 2]);

    // Handle edge cases explicitly
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    if (current === previous) {
      return 0;
    }

    const growth = ((current - previous) / previous) * 100;
    return Number(growth.toFixed(2)); // Precision control
  }
  // private calculateSLACompliance(
  //   fulfillmentData: DashboardDataAggregate['orderAnalytics']['fulfillment'][],
  //   targetHours = 48
  // ): number {
  //   if (!Array.isArray(fulfillmentData)) {
  //     return 0;
  //   }
  //   const totalOrders = fulfillmentData.reduce(
  //     (sum, item) => sum + item.count,
  //     0
  //   );
  //   const compliantOrders = fulfillmentData.reduce((sum, item) => {
  //     return item._id === OrderStatus.Completed &&
  //       item.avgFulfillmentTime <= targetHours
  //       ? sum + item.count
  //       : sum;
  //   }, 0);

  //   return totalOrders > 0 ? (compliantOrders / totalOrders) * 100 : 0;
  // }
  // 2. Revised SLA Compliance Calculator
  private calculateSLACompliance(
    fulfillmentData: DashboardDataAggregate["orderAnalytics"]["fulfillment"],
    targetHours = 48
  ): number {
    // Validate input structure
    if (!Array.isArray(fulfillmentData)) {
      return 0;
    }

    // Type-safe accumulation with fallbacks
    const { total, compliant } = fulfillmentData.reduce(
      (acc, item) => {
        const count = typeof item.count === "number" ? item.count : 0;
        const isCompliant =
          item._id === OrderStatus.Completed &&
          typeof item.avgFulfillmentTime === "number" &&
          item.avgFulfillmentTime <= targetHours;

        return {
          total: acc.total + count,
          compliant: acc.compliant + (isCompliant ? count : 0),
        };
      },
      { total: 0, compliant: 0 }
    );

    return total > 0 ? Number(((compliant / total) * 100).toFixed(2)) : 0;
  }
  private async calculateCityGrowth(
    city: string,
    country: string
  ): Promise<number> {
    const now = DateTime.now();
    const currentPeriodStart = now.minus({ weeks: 1 }).toJSDate();
    const previousPeriodStart = now.minus({ weeks: 2 }).toJSDate();

    const [currentCount, previousCount] = await Promise.all([
      UserModel.countDocuments({
        "security.loginHistory.location.city": city,
        "security.loginHistory.location.country": country,
        "security.loginHistory.timestamp": { $gte: currentPeriodStart },
      }),
      UserModel.countDocuments({
        "security.loginHistory.location.city": city,
        "security.loginHistory.location.country": country,
        "security.loginHistory.timestamp": {
          $gte: previousPeriodStart,
          $lt: currentPeriodStart,
        },
      }),
    ]);

    if (previousCount === 0) {
      return currentCount > 0 ? 100 : 0;
    }

    return Number(
      (((currentCount - previousCount) / previousCount) * 100).toFixed(1)
    );
  }
  private calculateRefundRate(refunds: number, totalRevenue: number): number {
    return totalRevenue > 0 ? (refunds / totalRevenue) * 100 : 0;
  }

  private calculateRepeatRate(
    repeatCustomers: number,
    totalOrders: number
  ): number {
    return totalOrders > 0 ? (repeatCustomers / totalOrders) * 100 : 0;
  }

  private calculatePercentage(numerator: number, denominator: number): number {
    return denominator > 0 ? (numerator / denominator) * 100 : 0;
  }
}
