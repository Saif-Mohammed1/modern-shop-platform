import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import {
  createOne,
  getAllWithoutLimit,
} from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Address from "@/app/_server/models/address.model";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = req.user._id;
    const { data, statusCode } = await getAllWithoutLimit(req, Address);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
export const POST = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    console.log("called");

    const { data, statusCode } = await createOne(req, Address);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
