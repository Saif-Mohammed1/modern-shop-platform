import { type NextRequest } from "next/server";

import twoFactorController from "@/app/server/controllers/2fa.controller";
import ErrorHandler from "@/app/server/controllers/error.controller";

export const POST = async (req: NextRequest) => {
  try {
    return await twoFactorController.validateBackupCodes(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
