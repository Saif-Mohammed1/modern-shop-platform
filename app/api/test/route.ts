import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { createOne, getAll } from "@/app/_server/controller/factoryController";
import { getUniqueCategories } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Address from "@/app/_server/models/address.model";
import Order from "@/app/_server/models/order.model ";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import Refund from "@/app/_server/models/refund.model";
import Report from "@/app/_server/models/report.model";
import Review from "@/app/_server/models/review.model";
import User from "@/app/_server/models/user.model";
import {
  createRandomAddresses,
  createRandomOrders,
  createRandomProducts,
  createRandomRefund,
  createRandomReport,
  createRandomReviews,
  createRandomUsers,
} from "@/components/util/faker";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const [products, users] = await Promise.all([
      Product.find().select("_id"),
      User.find().select("_id"),
    ]);
    const [reports, refunds] = await Promise.all([
      Report.create(createRandomReport(5, products, users)),
      Refund.create(createRandomRefund(10, users)),
    ]);
    return NextResponse.json({ data: null }, { status: 200 });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
