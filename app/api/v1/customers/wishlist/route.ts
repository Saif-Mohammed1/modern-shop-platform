import { type NextRequest } from "next/server";

import ErrorHandler from "@/app/server/controllers/error.controller";
import wishlistController from "@/app/server/controllers/wishlist.controller";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";

export const GET = async (req: NextRequest) => {
  try {
    await AuthMiddleware.requireAuth()(req);
    return await wishlistController.getMyWishlists(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
