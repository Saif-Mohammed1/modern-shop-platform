import { isAuth } from "@/app/_server/controller/authController";
import ErrorHandler from "@/app/_server/controller/errorController";
import { updateOne } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import User from "@/app/_server/models/user.model";
import { NextResponse } from "next/server";

export const PUT = async (req) => {
  try {
    await connectDB();
    await isAuth(req);
    req.id = req.user._id;
    const { data, statusCode } = await updateOne(req, User, ["name"]);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
