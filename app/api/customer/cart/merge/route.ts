import { isAuth } from "@/app/_server/controller/authController";
import { mergeLocalCartWithDBModel } from "@/app/_server/controller/cartController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import Cart from "@/app/_server/models/cart.model";
import { type NextRequest, NextResponse } from "next/server";
export const POST = async (req: NextRequest) => {
  //console.log("mergeLocalCartWithDBModel");
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
