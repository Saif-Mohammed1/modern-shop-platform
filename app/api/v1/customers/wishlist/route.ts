import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import wishlistController from "@/app/server/controllers/wishlist.controller";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await wishlistController.getMyWishlists(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
