import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { createOne, getAll } from "@/app/_server/controller/factoryController";
import { getUniqueCategories } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import Review from "@/app/_server/models/review.model";
import User from "@/app/_server/models/user.model";
import {
  createRandomProducts,
  createRandomReviews,
  createRandomUsers,
} from "@/components/util/faker";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    const products = await Product.find().select("_id");
    const users = await User.find().select("_id");

    const revews = await Review.create(createRandomReviews(products, users));
    return NextResponse.json({ data: null }, { status: 200 });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
