import { isAuth } from "@/app/_server/controller/authController";
import { getCartModel } from "@/app/_server/controller/cartController";
import ErrorHandler from "@/app/_server/controller/errorController";
// import { getDataByUser } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Cart, { ICartSchema } from "@/app/_server/models/cart.model";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await isAuth(req);
    const { data, statusCode } = await getCartModel(req, Cart);

    return NextResponse.json(
      {
        data,
      },
      { status: statusCode }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
