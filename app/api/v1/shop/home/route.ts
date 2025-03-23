// export const dynamic = "force-static";
// export const revalidate = 1800;
// export const revalidate = 60 * 30; //doesn't work ; // 1800
import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import ErrorHandler from "@/app/server/controllers/error.controller";
import productController from "@/app/server/controllers/product.controller";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    //no ned to pass req, as we are not using it in the function
    return await productController.getTopOffersAndNewProducts();
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
