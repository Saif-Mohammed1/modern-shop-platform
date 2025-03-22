import authController from "@/app/_server/controllers/auth.controller";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    console.log("im here+++++++++++++");
    await connectDB();

    return await authController.register(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
