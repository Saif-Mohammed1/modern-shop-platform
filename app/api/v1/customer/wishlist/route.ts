import ErrorHandler from "@/app/_server/controllers/errorController";
import favoriteController from "@/app/_server/controllers/favorite.controller";
import { connectDB } from "@/app/_server/db/db";
import { AuthService } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthService.requireAuth()(req);
    return await favoriteController.getFavorites(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
