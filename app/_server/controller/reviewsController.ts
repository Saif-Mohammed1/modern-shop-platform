import AppError from "@/components/util/appError";
import Order from "../models/order.model ";
import type { NextRequest } from "next/server";
import { reviewControllerTranslate } from "../_Translate/reviewControllerTranslate";
import { lang } from "@/components/util/lang";
import { IReviewSchema } from "../models/review.model";
import { Model } from "mongoose";
export const createReviews = async (
  req: NextRequest,
  model: Model<IReviewSchema>
) => {
  let doc;
  try {
    const { rating, reviewText } = await req.json();
    if (!rating) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.createReviews.ratingRequired,
        400
      );
    }
    if (!reviewText) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.createReviews.reviewTextRequired,
        400
      );
    }

    if (rating < 1) {
      throw new AppError(
        `${reviewControllerTranslate[lang].controllers.createReviews.ratingLessThanOne} ${rating}`,

        400
      );
    }
    doc = await model.create({
      user: req.user?._id,
      product: req.id,
      rating,
      reviewText,
    });
    return {
      // data: doc,
      data: doc,
      statusCode: 201,
    };
  } catch (error) {
    ////console.log("error createReviews", error);
    if (doc) {
      await model.findOneAndDelete(
        { product: req?.id, user: req.user?._id } // Condition to find the document
      );
    }
    throw error;
  }
};
export const deleteReview = async (
  req: NextRequest,
  model: Model<IReviewSchema>
) => {
  try {
    const doc = await model.findOneAndDelete(
      { product: req.id, user: req.user?._id } // Condition to find the document
    );
    if (!doc) {
      throw new AppError(
        reviewControllerTranslate[lang].errors.noDocumentsFound,
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

export const checkReview = async (
  req: NextRequest,
  model: Model<IReviewSchema>
) => {
  try {
    const order = await Order.findOne({
      user: req.user?._id,
      items: {
        $elemMatch: { _id: req.id },
      },
    });
    if (!order) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.needToBuyProductFirst,
        404
      );
    }

    if (order.status !== "completed") {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.needToWaitForOrderCompletion,
        404
      );
    }
    const review = await model.findOne({
      user: req.user?._id,
      product: req.id,
    });

    if (review) {
      throw new AppError(
        reviewControllerTranslate[
          lang
        ].controllers.checkReview.oneReviewPerProduct,
        400
      );
    }
    return {
      data: true,
      statusCode: 200,
    };
  } catch (error) {
    throw error; // Rethrow the error to be caught by the caller
  }
};

export const getReviews = async (
  req: NextRequest,
  model: Model<IReviewSchema>
) => {
  try {
    const reviews = await model.find({ product: req.id });

    return {
      data: reviews || [],
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
