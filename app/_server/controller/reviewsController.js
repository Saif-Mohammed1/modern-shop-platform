import AppError from "@/components/util/appError";
import Order from "../models/order.model ";

export const createReviews = async (req, model) => {
  let doc;
  try {
    const { rating, reviewText } = await req.json();
    if (!rating) {
      throw new AppError("Rating is required", 400);
    }
    if (!reviewText) {
      throw new AppError("reviewText is required", 400);
    }

    if (rating < 1) {
      throw new AppError(
        "Rating cannot be less than 1. Current rate is: " + rating,
        400
      );
    }
    doc = await model.create({
      user: req.user._id,
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
    //console.log("error createReviews", error);
    if (doc) {
      await model.findOneAndDelete(
        { product: req.id, user: req.user._id } // Condition to find the document
      );
    }
    throw error;
  }
};
export const deleteReview = async (req, model) => {
  try {
    const doc = await model.findOneAndDelete(
      { product: req.id, user: req.user._id } // Condition to find the document
    );
    if (!doc) {
      throw new AppError("No documents found with", 404);
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

export const checkReview = async (req, model) => {
  try {
    const order = await Order.findOne({
      user: req.user._id,
      items: {
        $elemMatch: { _id: req.id },
      },
    });
    if (!order) {
      throw new AppError(
        "You need to buy that product first to leave a review",
        404
      );
    }

    if (order.status !== "completed") {
      throw new AppError(
        "Thank you for your interest in leaving a review! Please note that you need to wait until  your order complete before you can leave a review. Once your order is completed, you'll be able to share your feedback with us. We appreciate your patience and understanding",
        404
      );
    }
    const review = await model.findOne({
      user: req.user._id,
      product: req.id,
    });

    if (review) {
      throw new AppError(
        "You have already submitted a review for this product. Only one review per product is allowed.",
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

export const getReviews = async (req, model) => {
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
