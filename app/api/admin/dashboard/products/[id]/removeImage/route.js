import { isAuth, restrictTo } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { deleteProductImages } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { NextResponse } from "next/server";

export const POST = async (req, { params }) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { message, statusCode } = await deleteProductImages(req, Product);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
