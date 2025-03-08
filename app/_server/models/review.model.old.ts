// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";

export interface IReviewSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUser["_id"]; // Only store the ObjectId of the User
  product: IProduct["_id"]; // Only store the ObjectId of the Product
  rating: number;
  reviewText: string;
  // createdAt: Date;
  // updatedAt: Date;
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
      required: true,
      index: true,
    },
    product: {
      type: Schema.Types.ObjectId,

      ref: "Product",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    reviewText: {
      type: String,
      minlength: 4,
      maxlength: 200,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.pre<Query<any, IReviewSchema>>(/^find/, function (next) {
  this.populate({
    path: "product",
    select: "name slug",
    model: Product,
    options: { lean: true },
  }).populate({
    path: "user",
    select: "name",
    model: User,
    options: { lean: true },
  });

  // this.populate({
  //   path: "user",
  //   select: "name email  ",
  //   model: User,
  // });
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
