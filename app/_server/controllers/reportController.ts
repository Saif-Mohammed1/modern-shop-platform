import { Model } from "mongoose";
import { type NextRequest } from "next/server";

import { IReportSchema } from "../models/Report.model";
import AppError from "@/app/lib/utilities/appError";
import { reportUsControllerTranslate } from "../../../public/locales/server/reportControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";

export const getReports = async (
  req: NextRequest,
  model: Model<IReportSchema>
) => {
  try {
    const doc = await model.find({ user: { $eq: req.user?._id } });
    if (!doc) {
      throw new AppError(
        reportUsControllerTranslate[lang].errors.notFound,
        404
      );
    }
    return {
      // data: doc,
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const createReport = async (
  req: NextRequest,
  model: Model<IReportSchema>
) => {
  let doc;
  try {
    const { issue, message } = await req.json();

    doc = await model.create({
      user: req.user?._id,
      name: req.user?.name,
      product: req.id,
      issue,
      message,
    });
    return {
      // data: doc,
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await model.findByIdAndDelete(doc._id);
    }
    throw error;
  }
};
export const deleteReport = async (
  req: NextRequest,
  model: Model<IReportSchema>
) => {
  try {
    await model.findOneAndDelete(
      { product: req.id, user: req.user?._id } // Condition to find the document
    );
    return {
      // data: doc,
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
