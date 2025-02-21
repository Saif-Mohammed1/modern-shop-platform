import ErrorHandler from "@/app/_server/controllers/errorController";
import favoriteController from "@/app/_server/controllers/favorite.controller";

import { connectDB } from "@/app/_server/db/db";
import { AuthService } from "@/app/_server/middlewares/auth.middleware";

import { type NextRequest } from "next/server";
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthService.requireAuth()(req);
    req.id = id;
    return await favoriteController.addFavorite(req);
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
    await AuthService.requireAuth()(req);
    req.id = id;
    return await favoriteController.removeFavorite(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
