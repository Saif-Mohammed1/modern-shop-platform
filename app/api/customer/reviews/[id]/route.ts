import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  checkReview,
  createReviews,
  getReviews,
} from "@/app/_server/controller/reviewsController";
import { connectDB } from "@/app/_server/db/db";
import Review from "@/app/_server/models/review.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  {
    params,
  }: {
    params: { id: string };
  }
) => {
  const { id } = params;
  try {
    await connectDB();
    req.id = id;
    const { data, statusCode, hasNextPage } = await getReviews(req, Review);
    return NextResponse.json({ data, hasNextPage }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    await checkReview(req, Review);
    const { data, statusCode } = await createReviews(req, Review);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const PATCH = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { data, statusCode } = await checkReview(req, Review);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
//api/customer/reviews/route.js
