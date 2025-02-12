import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { createOne, getAll } from "@/app/_server/controllers/factoryController";
import { getUniqueCategories } from "@/app/_server/controllers/productController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    // const categories = await getUniqueCategories(Product);

    // const { data, statusCode, pageCount } = await getAll<IProductSchema>(
    //   req,
    //   Product
    // );
    // Use Promise.all to run multiple asynchronous operations concurrently
    const [categories, { data, statusCode, pageCount }] = await Promise.all([
      getUniqueCategories(),
      getAll<IProductSchema>(req, Product),
    ]);
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

    const { data, statusCode } = await createOne<IProductSchema>(req, Product);
    return NextResponse.json({ data: data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
