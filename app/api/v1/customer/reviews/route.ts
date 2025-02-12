import { isAuth } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { getDataByUser } from "@/app/_server/controllers/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Review, { IReviewSchema } from "@/app/_server/models/review.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = String(req.user?._id);
    const { data, hasNextPage, statusCode } =
      await getDataByUser<IReviewSchema>(
        req,
        Review
        //   {

        //   path: "user",
        //   select: "name email",

        // }
      );
    return NextResponse.json({ data, hasNextPage }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
