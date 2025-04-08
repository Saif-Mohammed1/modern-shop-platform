// favorite.model.ts
import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

import { type IProduct } from "./Product.model";
import { type IUser } from "./User.model";

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
    toJSON: {
      virtuals: true,
      getters: true,
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

// Compound index to prevent duplicate favorites
WishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });
WishlistSchema.set("toJSON", { versionKey: false });
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

WishlistSchema.virtual("purchased", {
  type: Boolean,
  ref: "Order",
  localField: "productId",
  foreignField: "items.productId",
});

const WishlistModel: Model<IWishlist> =
  models.Wishlist || model<IWishlist>("Wishlist", WishlistSchema);
export default WishlistModel;
