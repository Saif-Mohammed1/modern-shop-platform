import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { createProduct } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");

    req.id = String(req.user?._id);
    const { data, statusCode } = await createProduct(req, Product);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
