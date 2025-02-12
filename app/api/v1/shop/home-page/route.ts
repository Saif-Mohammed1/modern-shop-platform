import ErrorHandler from "@/app/_server/controllers/errorController";
import { getTopOffersAndNewProducts } from "@/app/_server/controllers/productController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    const { data, statusCode } = await getTopOffersAndNewProducts();
    //no ned to pass req, as we are not using it in the function
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
