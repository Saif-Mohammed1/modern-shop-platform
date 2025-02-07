import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getAll } from "@/app/_server/controller/factoryController";
import {
  createProduct,
  getUniqueCategories,
} from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = String(req.user?._id);

    const categories = await getUniqueCategories();

    const { data, statusCode, pageCount } = await getAll<IProductSchema>(
      req,
      Product
    );

    return NextResponse.json(
      { data, categories, pageCount },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");

    req.id = String(req.user?._id);
    const { data, statusCode } = await createProduct(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
