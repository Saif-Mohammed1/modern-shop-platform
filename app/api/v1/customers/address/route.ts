import addressController from "@/app/_server/controllers/address.controller";
import ErrorHandler from "@/app/_server/controllers/errorController";

import { connectDB } from "@/app/_server/db/db";
import { AuthMiddleware } from "@/app/_server/middlewares/auth.middleware";
import { type NextRequest } from "next/server";

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
