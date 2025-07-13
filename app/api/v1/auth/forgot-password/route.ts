import { type NextRequest } from "next/server";

import authController from "@/app/server/controllers/auth.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";

export const POST = async (req: NextRequest) => {
  try {
    return await authController.forgotPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
