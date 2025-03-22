import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";

export const POST = async (req: NextRequest) => {
  try {
    await connectDB();

    return await authController.register(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
