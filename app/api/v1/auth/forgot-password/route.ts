import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    return await authController.forgotPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
