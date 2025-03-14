import Order, { IOrderSchema } from "../models/Order.model ";
import Product from "../models/Product.model";
import Refund, { IRefundSchema } from "../models/Refund.model";
import Report from "../models/Report.model";
import User from "../models/User.model";
import Cart from "../models/Cart.model";
import Wishlist from "../models/Wishlist.model";

export interface DashboardData {
  users: {
    total: number;
    growthPercentage: number;
    lastWeek: number;
    active: number;
    // NEW: Add user demographics
    // demographics: {
    //   regions: Record<string, number>;
    //   ageGroups: Record<string, number>;
    // };
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
    orders: IOrderSchema[];
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
// export const mainDashboard = async (): Promise<{
//   data: DashboardData;
//   statusCode: number;
// }> => {
//   try {
//     const currentDate = new Date();
//     const lastWeekDate = new Date();
//     lastWeekDate.setDate(currentDate.getDate() - 7);
//     const oneMonthAgo = new Date();
//     oneMonthAgo.setMonth(currentDate.getMonth() - 1);

//     // Parallelize database queries
//     const [
//       usersDetails,
//       ordersDetails,
//       earningsData,
//       productsDetails,
//       reportsDetails,
//       refundsDetails,
//       inventoryValue,
//       recentActivitiesOrders,
//       recentActivitiesRefunds,
//     ] = await Promise.all([
//       User.aggregate([
//         {
//           $group: {
//             _id: null,
//             total: { $sum: 1 },
//             active: { $sum: { $cond: [{ $eq: ["$active", true] }, 1, 0] } },
//             lastWeek: {
//               $sum: { $cond: [{ $gte: ["$createdAt", lastWeekDate] }, 1, 0] },
//             },
//           },
//         },
//       ]),
//       Order.aggregate([
//         {
//           $group: {
//             _id: "$status",
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//       Order.aggregate([
//         {
//           $match: { status: "completed" },
//         },
//         {
//           $group: {
//             _id: null,
//             totalEarnings: { $sum: "$totalPrice" },
//             weeklyEarnings: {
//               $sum: {
//                 $cond: [
//                   { $gte: ["$createdAt", lastWeekDate] },
//                   "$totalPrice",
//                   0,
//                 ],
//               },
//             },
//             dailyEarnings: {
//               $sum: {
//                 $cond: [
//                   // current day
//                   {
//                     $eq: [
//                       {
//                         $dateToString: {
//                           format: "%Y-%m-%d",
//                           date: "$createdAt",
//                         },
//                       },
//                       {
//                         $dateToString: { format: "%Y-%m-%d", date: new Date() },
//                       },
//                     ],
//                   },
//                   "$totalPrice",
//                   0,
//                 ],
//               },
//             },
//           },
//         },
//       ]),
//       Product.aggregate([
//         {
//           $group: {
//             _id: null,
//             total: { $sum: 1 },
//             outOfStock: { $sum: { $cond: [{ $lte: ["$stock", 0] }, 1, 0] } },
//             lowStock: { $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] } },
//             active: { $sum: { $cond: [{ $eq: ["$active", true] }, 1, 0] } },
//             categoryDistribution: {
//               $push: { category: "$category", count: 1 },
//             },
//             lastWeek: {
//               $sum: { $cond: [{ $gte: ["$createdAt", lastWeekDate] }, 1, 0] },
//             },
//           },
//         },
//       ]),
//       Report.aggregate([
//         {
//           $group: {
//             _id: "$status",
//             count: { $sum: 1 },
//           },
//         },
//       ]),
//       Refund.aggregate([
//         {
//           $group: {
//             _id: null,
//             total: { $sum: 1 },
//             trend: {
//               $sum: { $cond: [{ $gte: ["$createdAt", lastWeekDate] }, 1, 0] },
//             },
//             amount: { $sum: "$amount" },
//           },
//         },
//       ]),
//       Product.aggregate([
//         {
//           $group: {
//             _id: null,
//             totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
//           },
//         },
//       ]),
//       Order.find().sort({ createdAt: -1 }).limit(5).lean(),
//       Refund.find().sort({ createdAt: -1 }).limit(5).lean(),
//     ]);
//     // console.dir(usersDetails, { depth: null });
//     // console.dir(ordersDetails, { depth: null });
//     // console.dir(earningsData, { depth: null });
//     console.dir(productsDetails, { depth: null });
//     // console.dir(reportsDetails, { depth: null });
//     // console.dir(refundsDetails, { depth: null });
//     // console.dir(inventoryValue, { depth: null });
//     // console.dir(recentActivities, { depth: null });

//     // Extract values safely
//     const {
//       total: totalUsers = 0,
//       active: activeUsers = 0,
//       lastWeek: lastWeekUsers = 0,
//     } = usersDetails[0] || {};
//     const orderCounts = ordersDetails.reduce(
//       (acc, { _id, count }) => ({ ...acc, [_id]: count }),
//       {}
//     );
//     const {
//       totalEarnings = 0,
//       weeklyEarnings = 0,
//       dailyEarnings = 0,
//     } = earningsData[0] || {};
//     const {
//       total: totalProducts = 0,
//       outOfStock = 0,
//       lowStock = 0,
//       active: activeProducts = 0,
//       categoryDistribution = [],
//       lastWeek: lastWeekProducts = 0,
//     } = productsDetails[0] || {};
//     const reportCounts = reportsDetails.reduce((acc, { _id, count }) => {
//       acc["total"] = (acc["total"] || 0) + count;

//       return {
//         ...acc,
//         [_id]: count,
//       };
//     }, {});
//     const {
//       total: totalRefunds = 0,
//       trend: trendRefunds = 0,
//       amount: totalRefundAmount = 0,
//     } = refundsDetails[0] || {};
//     const inventoryTotalValue = inventoryValue[0]?.totalValue || 0;

//     return {
//       data: {
//         users: {
//           total: totalUsers,
//           growthPercentage:
//             ((totalUsers - lastWeekUsers) / Math.max(lastWeekUsers, 1)) * 100,
//           lastWeek: lastWeekUsers,
//           active: activeUsers,
//         },
//         orders: {
//           total: orderCounts.total || 0,
//           completed: orderCounts.completed || 0,
//           pending: orderCounts.pending || 0,
//           cancelled: orderCounts.cancelled || 0,
//           earnings: {
//             current: parseFloat(totalEarnings.toFixed(2)),
//             trend: parseFloat(weeklyEarnings.toFixed(2)),
//             daily: parseFloat(dailyEarnings.toFixed(2)), // Consider fetching daily earnings separately
//           },
//         },
//         products: {
//           total: totalProducts,
//           outOfStock,
//           lowStock,
//           active: activeProducts,
//           categoryDistribution: categoryDistribution.reduce(
//             (
//               acc: Record<string, number>,
//               item: { category: string; count: number }
//             ) => {
//               acc[item.category] = (acc[item.category] || 0) + item.count;
//               return acc;
//             },
//             {}
//           ),
//           // issue why it connected to users whats is matter
//           growthPercentage: parseFloat(
//             (
//               ((totalProducts - lastWeekProducts) /
//                 Math.max(totalProducts, 1)) *
//               100
//             ).toFixed(2)
//           ),
//           lastWeek: lastWeekProducts,
//         },
//         sales: {
//           total: orderCounts.completed || 0,
//           averageOrderValue:
//             // return float value 2 decimal places
//             // totalEarnings / Math.max(orderCounts.completed || 1, 1),
//             parseFloat(
//               (totalEarnings / Math.max(orderCounts.completed || 1, 1)).toFixed(
//                 2
//               )
//             ),
//           conversionRate:
//             ((orderCounts.completed || 0) /
//               Math.max(orderCounts.total || 1, 1)) *
//             100,
//         },
//         refunds: {
//           total: totalRefunds,
//           amount: parseFloat(totalRefundAmount.toFixed(2)), // Consider summing refund amounts if available
//           trend: trendRefunds,
//           // recent: [], // Fetch separately if needed
//         },
//         inventory: {
//           totalValue: inventoryTotalValue,
//           stockAlerts: outOfStock + lowStock,
//         },
//         reports: {
//           total: reportCounts.total || 0,
//           resolved: reportCounts.resolved || 0,
//           unresolved: (reportCounts.total || 0) - (reportCounts.resolved || 0),
//           resolutionRate: parseFloat(
//             (
//               ((reportCounts.resolved || 0) /
//                 Math.max(reportCounts.total || 1, 1)) *
//               100
//             ).toFixed(2)
//           ),
//         },
//         recentActivities: {
//           orders: recentActivitiesOrders, // Fetch separately
//           refunds: recentActivitiesRefunds, // Fetch separately
//         },
//       },
//       statusCode: 200,
//     };
//   } catch (error) {
//     throw error;
//   }
// };

export const mainDashboard = async (): Promise<{
  data: DashboardData;
  statusCode: number;
}> => {
  try {
    const currentDate = new Date();
    const lastWeekDate = new Date(currentDate);
    lastWeekDate.setDate(currentDate.getDate() - 7);
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);
    const todayStart = new Date(currentDate.setHours(0, 0, 0, 0));
    // Optimized parallel queries with proper aggregation
    const [
      usersDetails,
      ordersDetails,
      earningsData,
      productsDetails,
      reportsDetails,
      refundsDetails,
      inventoryValue,
      recentActivitiesOrders,
      recentActivitiesRefunds,
      topCartProducts,
      topWishlistProducts,
      topOrderedProducts,
      dailyOrdersCount,
    ] = await Promise.all([
      // User Analytics
      User.aggregate([
        {
          $facet: {
            total: [{ $count: "total" }],
            active: [{ $match: { active: true } }, { $count: "active" }],
            lastWeek: [
              { $match: { createdAt: { $gte: lastWeekDate } } },
              { $count: "lastWeek" },
            ],
          },
        },
      ]),

      // Order Status Breakdown
      Order.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalPrice: { $sum: "$totalPrice" },
          },
        },
      ]),

      // Earnings Analysis
      Order.aggregate([
        {
          $match: { status: "completed" },
        },
        {
          $facet: {
            totalEarnings: [
              { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ],
            weeklyEarnings: [
              { $match: { createdAt: { $gte: lastWeekDate } } },
              { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ],
            dailyEarnings: [
              {
                $match: {
                  createdAt: {
                    //  here we set hours to 0,0,0,0 to avoid midnight time erorr
                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                  },
                },
              },
              { $group: { _id: null, total: { $sum: "$totalPrice" } } },
            ],
          },
        },
      ]),

      // Product Analytics
      Product.aggregate([
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
                  lowStock: {
                    $sum: { $cond: [{ $lte: ["$stock", 10] }, 1, 0] },
                  },
                  active: {
                    $sum: { $cond: [{ $eq: ["$active", true] }, 1, 0] },
                  },
                  lastWeek: {
                    $sum: {
                      $cond: [{ $gte: ["$createdAt", lastWeekDate] }, 1, 0],
                    },
                  },
                },
              },
            ],
            categoryDistribution: [
              {
                $group: {
                  _id: "$category",
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]),

      // Report Analysis
      Report.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Refund Analysis
      Refund.aggregate([
        {
          $facet: {
            total: [{ $count: "total" }],
            trend: [
              { $match: { createdAt: { $gte: lastWeekDate } } },
              { $count: "trend" },
            ],
            amount: [{ $group: { _id: null, total: { $sum: "$amount" } } }],
          },
        },
      ]),

      // Inventory Valuation
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
          },
        },
      ]),

      // Recent Activities
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("totalPrice status createdAt")
        .lean(),

      Refund.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("amount status createdAt")
        .lean(),
      // New aggregations
      // Top products in carts
      Cart.aggregate([
        { $group: { _id: "$product", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Top products in Wishlists
      Wishlist.aggregate([
        { $group: { _id: "$product", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // // Top ordered products
      // Order.aggregate([
      //   { $unwind: "$items" },
      //   {
      //     $group: {
      //       _id: "$items.product",
      //       totalQuantity: { $sum: "$items.quantity" },
      //       totalOrders: { $sum: 1 },
      //     },
      //   },
      //   { $sort: { totalQuantity: -1 } },
      //   { $limit: 10 },
      // ]),
      Order.aggregate([
        { $unwind: "$items" }, // Deconstruct the items array
        {
          $group: {
            _id: "$items._id", // Group by product ID
            name: { $first: "$items.name" }, // Capture product name
            totalQuantity: { $sum: "$items.quantity" }, // Total quantity ordered
            totalOrders: { $addToSet: "$_id" }, // Collect unique order IDs
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            totalQuantity: 1,
            totalOrders: { $size: "$totalOrders" }, // Count unique orders
          },
        },
        { $sort: { totalQuantity: -1 } }, // Sort by highest quantity
        { $limit: 10 }, // Get top 10 products
      ]),

      // Daily orders count
      Order.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $count: "dailyOrders" },
      ]),
    ]);

    // console.dir(usersDetails, { depth: null });
    // console.dir(ordersDetails, { depth: null });
    // console.dir(earningsData, { depth: null });
    // console.dir(productsDetails, { depth: null });
    // console.dir(reportsDetails, { depth: null });
    // console.dir(refundsDetails, { depth: null });
    // console.dir(inventoryValue, { depth: null });
    // console.dir(recentActivities, { depth: null });
    // Data Transformation
    const userData = usersDetails[0];
    const orderCounts = ordersDetails.reduce(
      (acc, curr) => ({
        ...acc,
        [curr._id]: curr.count,
        total: (acc.total || 0) + curr.count,
      }),
      {}
    );

    const earnings = earningsData[0];
    const productData = productsDetails[0];
    const reportCounts = reportsDetails.reduce(
      (acc, curr) => ({
        ...acc,
        [curr._id]: curr.count,
        total: (acc.total || 0) + curr.count,
      }),
      {}
    );

    const refundData = refundsDetails[0];
    const inventoryTotal = inventoryValue[0]?.totalValue || 0;

    // Calculate growth percentages safely
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    // Data transformation
    const combinedInterestProducts = [
      ...topCartProducts,
      ...topWishlistProducts,
    ].reduce((acc, curr) => {
      const productId = curr._id.toString();
      acc.set(productId, (acc.get(productId) || 0) + curr.count);
      return acc;
    }, new Map<string, number>());
    const topInterestProducts = Array.from(combinedInterestProducts.entries())
      .map((entry) => {
        const [productId, count] = entry as [string, number];
        return { productId, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    // const topInterestProducts = Array.from(combinedInterestProducts.entries())
    //   .map(([productId, count]: [string, number]) => ({ productId, count }))
    //   .sort((a, b) => b.count - a.count)
    //   .slice(0, 10);
    return {
      data: {
        users: {
          total: userData?.total[0]?.total || 0,
          active: userData?.active[0]?.active || 0,
          lastWeek: userData?.lastWeek[0]?.lastWeek || 0,
          growthPercentage: parseFloat(
            calculateGrowth(
              userData?.lastWeek[0]?.lastWeek || 0,
              userData?.total[0]?.total || 0
            ).toFixed(2)
          ),
        },
        orders: {
          total: orderCounts.total || 0,
          completed: orderCounts.completed || 0,
          pending: orderCounts.pending || 0,
          cancelled: orderCounts.cancelled || 0,
          earnings: {
            current: parseFloat(
              (earnings?.totalEarnings[0]?.total || 0).toFixed(2)
            ),
            trend: parseFloat(
              (earnings?.weeklyEarnings[0]?.total || 0).toFixed(2)
            ),
            daily: parseFloat(
              (earnings?.dailyEarnings[0]?.total || 0).toFixed(2)
            ),
          },
        },
        products: {
          total: productData?.stockInfo[0]?.total || 0,
          outOfStock: productData?.stockInfo[0]?.outOfStock || 0,
          lowStock: productData?.stockInfo[0]?.lowStock || 0,
          active: productData?.stockInfo[0]?.active || 0,
          categoryDistribution:
            productData?.categoryDistribution?.reduce(
              (acc: Record<string, number>, curr: Record<string, number>) => ({
                ...acc,
                [curr._id]: curr.count,
              }),
              {}
            ) || {},
          growthPercentage: calculateGrowth(
            productData?.stockInfo[0]?.lastWeek || 0,
            productData?.stockInfo[0]?.total || 0
          ),
          lastWeek: productData?.stockInfo[0]?.lastWeek || 0,
        },
        sales: {
          total: orderCounts.completed || 0,
          averageOrderValue: parseFloat(
            (orderCounts.completed > 0
              ? (earnings?.totalEarnings[0]?.total || 0) / orderCounts.completed
              : 0
            ).toFixed(2)
          ),
          conversionRate: parseFloat(
            (orderCounts.total > 0
              ? (orderCounts.completed / orderCounts.total) * 100
              : 0
            ).toFixed(2)
          ),
        },
        refunds: {
          total: refundData?.total[0]?.total || 0,
          amount: parseFloat((refundData?.amount[0]?.total || 0).toFixed(2)),
          trend: parseFloat((refundData?.trend[0]?.trend || 0).toFixed(2)),
        },
        inventory: {
          totalValue: inventoryTotal,
          stockAlerts:
            (productData?.stockInfo[0]?.outOfStock || 0) +
            (productData?.stockInfo[0]?.lowStock || 0),
        },
        reports: {
          total: reportCounts.total || 0,
          resolved: reportCounts.resolved || 0,
          unresolved: reportCounts.total - reportCounts.resolved,
          resolutionRate: parseFloat(
            (reportCounts.total > 0
              ? (reportCounts.resolved / reportCounts.total) * 100
              : 0
            ).toFixed(2)
          ),
        },
        recentActivities: {
          orders: recentActivitiesOrders,
          refunds: recentActivitiesRefunds,
        },
        userInterestProducts: topInterestProducts,
        topOrderedProducts: topOrderedProducts.map((p) => ({
          productId: p._id,
          productName: p.name,
          productSlug: p.name.toLowerCase().replace(/\s/g, "-"),
          totalQuantity: p.totalQuantity,
          totalOrders: p.totalOrders,
        })),
        dailyOrders: dailyOrdersCount[0]?.dailyOrders || 0,
      },
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
