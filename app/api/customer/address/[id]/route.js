import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  deleteOne,
  updateOne,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Address from "@/app/_server/models/address.model";
import { NextResponse } from "next/server";

export const PATCH = async (req, { params }) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { data, statusCode } = await updateOne(req, Address, [
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

export const DELETE = async (req, { params }) => {
  const { id } = params;
  try {
    await connectDB();
    await isAuth(req);
    req.id = id;
    const { data, statusCode } = await deleteOne(req, Address);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
