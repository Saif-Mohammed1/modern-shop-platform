import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  getAll,
  getUniqueCategories,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectDB();
    const categories = await getUniqueCategories(Product);

    const { data, statusCode, pageCount } = await getAll(req, Product);

    return NextResponse.json(
      { data, categories, pageCount },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");

    const { data, statusCode } = await create(req, Product);
    return NextResponse.json({ data: [], categories }, { status: 200 });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
