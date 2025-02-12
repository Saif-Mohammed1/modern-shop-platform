import { isAuth, restrictTo } from "@/app/_server/controllers/authController";
import ErrorHandler from "@/app/_server/controllers/errorController";
import { deleteProductImages } from "@/app/_server/controllers/productController";
import { connectDB } from "@/app/_server/db/db";
import { type NextRequest, NextResponse } from "next/server";

export const POST = async (
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
    await isAuth(req);
    await restrictTo(req, "admin");
    req.id = id;
    const { message, statusCode } = await deleteProductImages(req);
    return NextResponse.json({ message }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
