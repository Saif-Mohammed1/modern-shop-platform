import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    // await connectDB();
    // //  i want to update all product to have slug field
    // const products = await Product.find();
    // products.forEach(async (product) => {
    //   product.slug = product.name.toLowerCase().split(" ").join("-");
    //   await product.save();
    // });
    console.log("Hello from the API 1");
    return NextResponse.json({ data: "Hello from the API" }, { status: 200 });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
