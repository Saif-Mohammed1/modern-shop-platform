import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  deleteOne,
  updateOne,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Address, { IAddressSchema } from "@/app/_server/models/address.model";
import { type NextRequest, NextResponse } from "next/server";

export const PATCH = async (
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
    req.id = id;
    const { data, statusCode } = await updateOne<IAddressSchema>(req, Address, [
      "street",
      "city",
      "state",
      "postalCode",
      "country",
      "phone",
    ]);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};

export const DELETE = async (
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
    req.id = id;
    const { data, statusCode } = await deleteOne<IAddressSchema>(req, Address);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
