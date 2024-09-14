import ErrorHandler from "@/app/_server/controller/errorController";
import { getTopOffersAndNewProducts } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();

    const { data, statusCode } = await getTopOffersAndNewProducts(req, Product);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
