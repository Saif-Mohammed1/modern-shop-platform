import AppError from "@/app/lib/util/appError";
import type { NextRequest } from "next/server";
import { lang } from "@/app/lib/util/lang";
import { Model } from "mongoose";
import { cartControllerTranslate } from "../_Translate/cartControllerTranslate";
import { IFavoriteSchema } from "../models/favorite.model";

export const getFav = async (
  req: NextRequest,
  model: Model<IFavoriteSchema>
) => {
  try {
    const doc = await model.find({ user: req?.user?._id });

    return {
      // data: doc,
      data: doc,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
export const createFav = async (
  req: NextRequest,
  model: Model<IFavoriteSchema>
) => {
  let doc;
  try {
    doc = await model.create({
      user: req.user?._id,
      product: req.id,
    });
    return {
      // data: doc,
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    if (doc) {
      await model.findOneAndDelete(
        { product: req.id, user: req.user?._id } // Condition to find the document
      );
      throw error;
    }
  }
};
export const deleteFav = async (
  req: NextRequest,
  model: Model<IFavoriteSchema>
) => {
  try {
    const doc = await model.findOneAndDelete(
      { product: req.id, user: req.user?._id } // Condition to find the document
    );
    if (!doc) {
      throw new AppError(
        cartControllerTranslate[lang].errors.noDocumentsFoundWithId,
        404
      );
    }
    return {
      // data: doc,
      data: null,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
