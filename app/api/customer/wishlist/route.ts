import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getFav } from "@/app/_server/controller/favoriteController";
// import { getDataByUser } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Favorite, { IFavoriteSchema } from "@/app/_server/models/favorite.model";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();

    await isAuth(req);
    const { data, statusCode } = await getFav(req, Favorite);
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
