// favorite.model.ts
import { Document, Model, Schema, Types, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";
import AppError from "@/app/lib/utilities/appError";
import { commonTranslations } from "@/public/locales/server/Common.Translate";
import { lang } from "@/app/lib/utilities/lang";

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  userId: IUser["_id"];
  productId: IProduct["_id"];
  createdAt: Date;
  updatedAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
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
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Virtual population (if needed)
FavoriteSchema.virtual("user", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

FavoriteSchema.virtual("product", {
  ref: "Product",
  localField: "productId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save validation for references
FavoriteSchema.pre<IFavorite>("save", async function (next) {
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

const FavoriteModel: Model<IFavorite> =
  models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);
export default FavoriteModel;
