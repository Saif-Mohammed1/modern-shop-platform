import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { getAll } from "@/app/_server/controllers/factoryController";
import {
  createProduct,
  getUniqueCategories,
} from "@/app/_server/controllers/productController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/Product.model";
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
