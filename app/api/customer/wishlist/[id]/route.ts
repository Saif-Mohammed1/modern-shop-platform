import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  createFav,
  deleteFav,
} from "@/app/_server/controller/favoriteController";
import { connectDB } from "@/app/_server/db/db";
import Favorite from "@/app/_server/models/favorite.model";

import { type NextRequest, NextResponse } from "next/server";
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const result = await createFav(req, Favorite);
    if (!result) {
      throw new Error("Failed to create favorite");
    }
    const { data, statusCode } = result;

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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { data, statusCode } = await deleteFav(req, Favorite);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
