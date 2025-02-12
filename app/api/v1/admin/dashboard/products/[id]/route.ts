import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { getOne } from "@/app/_server/controllers/factoryController";
import {
  deleteProduct,
  updateProduct,
} from "@/app/_server/controllers/productController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { data, statusCode } = await getOne<IProductSchema>(req, Product);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PUT = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;

    /**      name,
      category,
      description,
      price,
      discount,
      stock,
      images,
      discountExpire, */
    const { data, statusCode } = await updateProduct(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const DELETE = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { data, statusCode } = await deleteProduct(req);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
