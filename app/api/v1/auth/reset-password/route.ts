import { type NextRequest } from "next/server";

import authController from "@/app/server/controllers/auth.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";

export const GET = async (req: NextRequest) => {
  try {
    return await authController.isEmailAndTokenValid(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    return await authController.resetPassword(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
