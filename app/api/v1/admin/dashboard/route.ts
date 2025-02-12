import { mainDashboard } from "@/app/_server/controllers/adminDashboardController";
import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = String(req.user?._id);
    const { data, statusCode } = await mainDashboard();
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
