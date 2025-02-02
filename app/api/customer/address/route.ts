import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  createOne,
  getAllWithoutLimit,
  getDataByUser,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Address, { IAddressSchema } from "@/app/_server/models/address.model";
import { type NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = String(req.user?._id);

    const { data, hasNextPage, statusCode } =
      await getDataByUser<IAddressSchema>(
        req,
        // req, no need to pass req
        Address
      );
    return NextResponse.json({ data, hasNextPage }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    await isAuth(req);

    const { data, statusCode } = await createOne<IAddressSchema>(req, Address);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
