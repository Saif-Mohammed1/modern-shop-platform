import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import wishlistController from "@/app/_server/controllers/wishlist.controller";
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = id;
    return await wishlistController.toggleWishlist(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
