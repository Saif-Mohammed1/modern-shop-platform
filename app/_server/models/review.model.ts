import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import Product, { IProductSchema } from "./product.model";
import { reviewControllerTranslate } from "../_Translate/reviewControllerTranslate";
import { lang } from "@/components/util/lang";
export interface IReviewSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUserSchema["_id"]; // Only store the ObjectId of the User
  product: IProductSchema["_id"]; // Only store the ObjectId of the Product
  rating: number;
  reviewText: string;
  createdAt: Date;
}
interface IReviewModel extends Model<IReviewSchema> {
  calcAverageRatings(productId: string): Promise<void>;
}
interface IReviewQuery extends Query<IReviewSchema, IReviewSchema> {
  r?: IReviewSchema | null;
}

const ReviewSchema = new Schema<IReviewSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: [
        true,
        reviewControllerTranslate[lang].model.schema.user.required,
      ],
    },
    product: {
      type: Schema.Types.ObjectId,

      ref: "Product",
      required: [
        true,
        reviewControllerTranslate[lang].model.schema.product.required,
      ],
    },
    rating: {
      type: Number,
      min: [1, reviewControllerTranslate[lang].model.schema.rating.min],
      max: [5, reviewControllerTranslate[lang].model.schema.rating.max],
      required: [
        true,
        reviewControllerTranslate[lang].model.schema.rating.required,
      ],
    },
    reviewText: {
      type: String,
      minlength: [
        4,
        reviewControllerTranslate[lang].model.schema.reviewText.minlength,
      ],
      maxlength: [
        200,
        reviewControllerTranslate[lang].model.schema.reviewText.maxlength,
      ],
      required: [
        true,
        reviewControllerTranslate[lang].model.schema.reviewText.required,
      ],
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
ReviewSchema.pre<Query<any, IReviewSchema>>(/^find/, function (next) {
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

ReviewSchema.statics.calcAverageRatings = async function (productId: string) {
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
  (this.constructor as IReviewModel).calcAverageRatings(
    this.product.toString()
  );
});
// findByIdAndUpdate
// findByIdAndDelete
ReviewSchema.pre<IReviewQuery>(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // ////console.log(this.r);
  next();
});

ReviewSchema.post<IReviewQuery>(/^findOneAnd/, async function () {
  // await this.findOne(); does NOT work here, query has already executed
  // await this.r.constructor.calcAverageRatings(this.r.product);
  if (this.r) {
    await (this.r.constructor as IReviewModel).calcAverageRatings(
      this.r.product.toString()
    );
  }
});

const Review: Model<IReviewSchema> =
  models.Review || model<IReviewSchema, IReviewModel>("Review", ReviewSchema);
export default Review;
