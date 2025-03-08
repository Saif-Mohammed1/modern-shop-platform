import { Document, Model, Query, Schema, model, models } from "mongoose";
import Product, { IProduct } from "./Product.model";
import UserModel, { IUser } from "./User.model";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";

export interface IReview extends Document {
  // _id: Schema.Types.ObjectId; // makes error
  userId: IUser["_id"];
  productId: IProduct["_id"];
  rating: number;
  comment: string;
}

interface IReviewModel extends Model<IReview> {
  calcAverageRatings(productId: string): Promise<void>;
}

const reviewSchema = new Schema<IReview, IReviewModel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, minlength: 4, maxlength: 200, required: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        ["createdAt", "updatedAt"].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split("T")[0];
          }
        });
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Indexes
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.set("toJSON", { versionKey: false });
// Virtual populate
reviewSchema.virtual("users", {
  ref: "User",
  foreignField: "_id",
  localField: "userId",
  justOne: true,
});

// Query Middleware
// reviewSchema.pre<Query<IReview, IReview>>(/^find/, function (next) {
//   this.populate({
//     path: "userId",
//     select: "name email",
//     model: UserModel,
//   }).populate({
//     path: "productId",
//     select: "name slug",
//     model: Product,
//     // options: { lean: true },
//   });
//   next();
// });

// Static Methods
reviewSchema.statics.calcAverageRatings = async function (productId: string) {
  const stats = await this.aggregate([
    { $match: { productId: assignAsObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsQuantity: stats[0]?.nRating || 0,
    ratingsAverage: stats[0]?.avgRating || 4.5,
  });
};

// Document Middleware
reviewSchema.post("save", function (this: IReview) {
  (this.constructor as IReviewModel).calcAverageRatings(
    this.productId.toString()
  );
});

// Query Middleware for updates
reviewSchema.pre<Query<IReview, IReview>>(/^findOneAnd/, async function (next) {
  this.set({ _r: await this.findOne().clone() });
  next();
});

reviewSchema.post<Query<IReview, IReview>>(/^findOneAnd/, async function () {
  const doc = this.get("_r");
  if (doc)
    await (doc.constructor as IReviewModel).calcAverageRatings(
      doc.productId.toString()
    );
});

const ReviewModel = (models.Review ||
  model<IReview, IReviewModel>("Review", reviewSchema)) as IReviewModel;
export default ReviewModel;
