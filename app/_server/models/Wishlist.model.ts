// favorite.model.ts
import { Document, Model, Schema, Types, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";
import AppError from "@/app/lib/utilities/appError";
import { commonTranslations } from "@/public/locales/server/Common.Translate";
import { lang } from "@/app/lib/utilities/lang";

export interface IWishlist extends Document {
  _id: Types.ObjectId;
  userId: IUser["_id"];
  productId: IProduct["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const WishlistSchema = new Schema<IWishlist>(
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate favorites
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Virtual population (if needed)
WishlistSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

WishlistSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save validation for references
WishlistSchema.pre<IWishlist>("save", async function (next) {
  try {
    const [userExists, productExists] = await Promise.all([
      User.exists({ _id: this.userId }),
      Product.exists({ _id: this.productId }),
    ]);

    if (!userExists)
      throw new AppError(commonTranslations[lang].userDoesNotExist, 404);
    if (!productExists)
      throw new AppError(commonTranslations[lang].productDoesNotExist, 404);
    next();
  } catch (error) {
    next(error as Error);
  }
});

const WishlistModel: Model<IWishlist> =
  models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);
export default WishlistModel;
