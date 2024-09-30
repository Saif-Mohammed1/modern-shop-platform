import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { deleteOne } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import RefreshToken, {
  IRefreshTokenSchema,
} from "@/app/_server/models/refreshToken.model";
import { type NextRequest, NextResponse } from "next/server";
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { data, statusCode } = await deleteOne<IRefreshTokenSchema>(
      req,
      RefreshToken
    );
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
