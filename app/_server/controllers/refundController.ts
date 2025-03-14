import AppError from "@/app/lib/utilities/appError";
import User from "../models/User.model";
import Order from "../models/Order.model ";
import type { NextRequest } from "next/server";
import { Model } from "mongoose";
import { IRefundSchema } from "../models/Refund.model";
import { refundUsControllerTranslate } from "../../../public/locales/server/refundControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";

export const createRefund = async (
  req: NextRequest,
  Model: Model<IRefundSchema>
) => {
  let doc;
  try {
    let { issue, message, invoiceId, amount } = await req.json();

    if (!issue || !invoiceId || !message || !amount) {
      throw new AppError(
        refundUsControllerTranslate[lang].controller.dataRequired,
        400
      );
    }

    const existingInvoice = await Order.findOne({
      user: req?.user?._id,
      invoiceId,
    });
    if (!existingInvoice) {
      throw new AppError(
        refundUsControllerTranslate[lang].controller.invalidInvoiceId,
        404
      );
    }
    doc = await Model.create({
      user: req?.user?._id,
      amount,
      issue,
      invoiceId,
      reason: message,
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
export const updateRefundStatus = async (
  req: NextRequest,
  Model: Model<IRefundSchema>
) => {
  try {
    let { email, status } = await req.json();
    if (!email || !status) {
      throw new AppError(
        refundUsControllerTranslate[lang].controller.dataRequired,
        400
      );
    }
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError(
        refundUsControllerTranslate[lang].errors.userNotFound,

        400
      );
    }
    const doc = await Model.findOneAndUpdate(
      {
        user: user._id,
      },
      { status },
      { new: true, runValidators: true }
    );

    return {
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
