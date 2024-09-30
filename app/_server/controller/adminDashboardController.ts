import Order from "../models/order.model ";
import Product from "../models/product.model";
import Refund from "../models/refund.model";
import Report from "../models/report.model";
import User from "../models/user.model";

// provide all data
export const mainDashboard = async () => {
  // Get current date and last week’s date
  const currentDate = new Date();
  const lastWeekDate = new Date(currentDate);
  lastWeekDate.setDate(currentDate.getDate() - 7);

  try {
    // Users
    const currentUserCount = await User.countDocuments();
    const lastWeekUserCount = await User.countDocuments({
      createdAt: { $gte: lastWeekDate },
    });

    // Orders (Completed only for earnings)
    const currentOrderCount = await Order.countDocuments();
    const completedOrders = await Order.aggregate([
      { $match: { status: "completed", createdAt: { $gte: lastWeekDate } } },
      { $group: { _id: null, totalEarnings: { $sum: "$totalPrice" } } },
    ]);

    const totalEarnings = completedOrders[0]?.totalEarnings || 0;

    // Reports
    const currentReportCount = await Report.countDocuments();
    const lastWeekReportCount = await Report.countDocuments({
      createdAt: { $gte: lastWeekDate },
    });

    // Refunds
    const currentRefundCount = await Refund.countDocuments();
    const refunds = await Refund.aggregate([
      { $match: { createdAt: { $gte: lastWeekDate } } },
      { $group: { _id: null, totalRefundLoss: { $sum: "$refundAmount" } } },
    ]);

    const totalRefundLoss = refunds[0]?.totalRefundLoss || 0;

    // Calculate differences from last week
    const userGrowth = lastWeekUserCount;
    const reportGrowth = lastWeekReportCount;
    // const refundGrowth = currentRefundCount;

    // res.status(200).json({
    //   users: { count: currentUserCount, growth: userGrowth },
    //   orders: { count: currentOrderCount, earnings: totalEarnings },
    //   reports: { count: currentReportCount, growth: reportGrowth },
    //   refunds: { count: currentRefundCount, loss: totalRefundLoss },
    // });

    // Inside your handler function:
    const currentProductCount = await Product.countDocuments();
    const lastWeekProductCount = await Product.countDocuments({
      createdAt: { $gte: lastWeekDate },
    });

    const productGrowth = currentProductCount - lastWeekProductCount;

    // Include this in your response
    return {
      data: {
        users: { count: currentUserCount, growth: userGrowth },
        orders: { count: currentOrderCount, earnings: totalEarnings },
        reports: { count: currentReportCount, growth: reportGrowth },
        refunds: { count: currentRefundCount, loss: totalRefundLoss },
        products: { count: currentProductCount, growth: productGrowth }, // Add product data
      },
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
