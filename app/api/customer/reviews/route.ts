import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { getDataByUser } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Review, { IReviewSchema } from "@/app/_server/models/review.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = String(req.user?._id);
    const { data, statusCode } = await getDataByUser<IReviewSchema>(
      req,
      Review
    );
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
