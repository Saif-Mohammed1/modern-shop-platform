import AppError from "@/app/lib/util/appError";
import User from "../models/user.model";
import type { NextRequest } from "next/server";
import { Model } from "mongoose";
import Order, { IOrderSchema } from "../models/order.model ";
import { orderControllerTranslate } from "../_Translate/orderControllerTranslate";
import { lang } from "@/app/lib/util/lang";

export const createUserOrder = async (
  req: NextRequest,
  Model: Model<IOrderSchema>
) => {
  let doc;

  try {
    let { email, invoiceId, invoiceLink } = await req.json();

    if (!email || !invoiceId || !invoiceLink) {
      throw new AppError(
        orderControllerTranslate[
          lang
        ].controllers.createUserOrder.notEnoughData,
        400
      );
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError(
        orderControllerTranslate[lang].errors.userNotFound,
        400
      );
    }
    doc = await Model.create({
      user: user._id,

      invoiceId,
      invoiceLink,
    });

    return {
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await Model.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};

export const getLatestOrder = async (
  req: NextRequest,
  Model: Model<IOrderSchema>
) => {
  try {
    const doc = await Model.findOne({ user: req.user?._id }).sort({
      createdAt: -1,
    });
    if (!doc) {
      throw new AppError(orderControllerTranslate[lang].errors.noDocFound, 404);
    }
    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};

export const getOrders = async (req: NextRequest) => {
  try {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);

    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "10", 10);
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const email = searchParams.get("email");

    const query: any = {};

    // Status filter
    if (status) query.status = status;

    // Email search
    if (email) {
      const users = await User.find({ email: new RegExp(email, "i") })
        .select("_id")
        .lean();
      if (!users.length)
        return {
          orders: [],
          pageCount: 0,
          statusCode: 200,
        };
      query.user = { $in: users.map((u) => u._id) };
    }
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const endOfDay = new Date(endDate as string);
        endOfDay.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endOfDay;
      }
    }
    // Get total count and orders
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query).skip(skip).limit(limit).lean();

    return {
      orders,
      pageCount: Math.ceil(total / limit),
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
