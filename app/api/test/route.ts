import ErrorHandler from "@/app/_server/controller/errorController";
import { connectDB } from "@/app/_server/db/db";
import Order from "@/app/_server/models/order.model ";
import Product, { IProductSchema } from "@/app/_server/models/product.model";
import User from "@/app/_server/models/user.model";
import { createRandomOrders } from "@/components/util/faker";
import { type NextRequest, NextResponse } from "next/server";
export const GET = async (req: NextRequest) => {
  try {
    await connectDB();
    // //  i want to update all product to have slug field
    const products = await Product.find().lean();
    const users = await User.find().lean();
    // products.forEach(async (product) => {
    //   product.slug = product.name.toLowerCase().split(" ").join("-");
    //   await product.save();
    // });
    // console.log("Hello from the API 1");

    await Promise.all(
      await Order.create(createRandomOrders(10, products, users))
    );
    return NextResponse.json({ data: "Hello from the API" }, { status: 200 });
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
