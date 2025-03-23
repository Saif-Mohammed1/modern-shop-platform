import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import wishlistController from "@/app/server/controllers/wishlist.controller";
export const POST = async (
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) => {
  const params = await props.params;
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
