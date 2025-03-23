import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import { AuthMiddleware } from "@/app/server/middlewares/auth.middleware";
import ErrorHandler from "@/app/server/controllers/error.controller";
import addressController from "@/app/server/controllers/address.controller";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    req.id = String(req.user?._id);

    return await addressController.getMyAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await AuthMiddleware.requireAuth()(req);
    return await addressController.addAddress(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
