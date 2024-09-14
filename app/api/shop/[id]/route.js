import ErrorHandler from "@/app/_server/controller/errorController";
import { getOne } from "@/app/_server/controller/factoryController";
import { connectDB } from "@/app/_server/db/db";
import Product from "@/app/_server/models/product.model";
import { NextResponse } from "next/server";
export const GET = async (req, { params }) => {
  const { id } = params;
  try {
    await connectDB();
    req.id = id;
    const { data, statusCode } = await getOne(req, Product);
    return NextResponse.json({ data }, { status: statusCode });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
