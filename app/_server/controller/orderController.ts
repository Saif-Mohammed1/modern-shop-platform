import AppError from "@/components/util/appError";
import User from "../models/user.model";
import type { NextRequest } from "next/server";
import { Model } from "mongoose";
import { IOrderSchema } from "../models/order.model ";
import { orderControllerTranslate } from "../_Translate/orderControllerTranslate";
import { lang } from "@/components/util/lang";

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
