import ErrorHandler from "@/app/_server/controller/errorController";
import { getTopOffersAndNewProducts } from "@/app/_server/controller/productController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const { data, statusCode } = await getTopOffersAndNewProducts(
      //no ned to pass req, as we are not using it in the function
      Product
    );
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
