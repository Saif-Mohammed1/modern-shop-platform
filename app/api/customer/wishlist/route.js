import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getDataByUser } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Favorite from "@/app/_server/models/favorite.model";
import { NextResponse } from "next/server";
export const GET = async (req) => {
  try {
    await connectDB();

    await isAuth(req);
    const { data, statusCode } = await getDataByUser(req, Favorite, {
      path: "product",
    });
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
