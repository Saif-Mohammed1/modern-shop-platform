import { Schema, model, models } from "mongoose";
import User from "./user.model";
import Product from "./product.model";
const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
    product: {
      type: Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product."],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be at least 1."],
      max: [5, "Rating cannot be more than 5."],
      required: [true, "Rating is required."],
    },
    reviewText: {
      type: String,
      minlength: [4, "Review must be at least 4 characters long."],
      maxlength: [200, "Review cannot exceed 200 characters."],
      required: [true, "reviewText is required."],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'product',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photo'
  // });

  this.populate({
    path: "user",
    select: "name ",
  });
  next();
});

ReviewSchema.statics.calcAverageRatings = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  // ////console.log(stats);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

ReviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.product);
});
// findByIdAndUpdate
// findByIdAndDelete
ReviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // ////console.log(this.r);
  next();
});

ReviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.product);
});

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
