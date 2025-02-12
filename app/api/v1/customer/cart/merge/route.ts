import { isAuth } from "@/app/_server/controllers/authController";
import { mergeLocalCartWithDBModel } from "@/app/_server/controllers/cartController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import Cart from "@/app/_server/models/cart.model";
import { type NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    await isAuth(req);
    await mergeLocalCartWithDBModel(req, Cart);

    return NextResponse.json(
      {
        data: null,
      },
      { status: 200 }
    );
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
