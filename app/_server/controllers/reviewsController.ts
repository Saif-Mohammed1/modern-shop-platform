import AppError from "@/app/lib/utilities/appError";
import Order from "../models/order.model ";
import type { NextRequest } from "next/server";
import { reviewControllerTranslate } from "../../../public/locales/server/reviewControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Review from "../models/review.model";
export const createReviews = async (req: NextRequest) => {
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
    doc = await Review.create({
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
    if (doc) {
      await Review.findOneAndDelete(
        { product: req?.id, user: req.user?._id } // Condition to find the document
      );
    }
    throw error;
  }
};
export const deleteReview = async (req: NextRequest) => {
  try {
    const doc = await Review.findOneAndDelete(
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

export const checkReview = async (req: NextRequest) => {
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
    const review = await Review.findOne({
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

export const getReviews = async (req: NextRequest) => {
  try {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    const page = searchParams.get("page") ?? "1";
    const limit = 10;
    const currentPage = parseInt(page, 10);
    const skip = (currentPage - 1) * limit;
    // const reviews = await model.find({ product: req.id });
    // get ten documents from the collection and return number of documents in the collection
    if (!req.id) {
      throw new AppError("Invalid product id", 400);
    }
    const [reviews, totalCount] = await Promise.all([
      Review.find({ product: req.id })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Review.countDocuments({ product: req.id }),
    ]);

    const hasNextPage = totalCount > currentPage * limit;
    return {
      data: reviews || [],
      hasNextPage,
      statusCode: 200,
    };
  } catch (error) {
    throw error;
  }
};
