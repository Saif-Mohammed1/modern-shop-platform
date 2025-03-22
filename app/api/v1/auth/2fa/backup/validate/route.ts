import { type NextRequest } from "next/server";
import { connectDB } from "@/app/_server/db/db";
import ErrorHandler from "@/app/_server/controllers/error.controller";
import twoFactorController from "@/app/_server/controllers/2fa.controller";
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    return await twoFactorController.validateBackupCodes(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
