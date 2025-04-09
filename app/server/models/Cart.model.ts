import { Schema, model, models, type Document, type Model } from "mongoose";

import _ProductModel, { type IProduct } from "./Product.model";
import _UserModel, { type IUser } from "./User.model";

// Interface for Cart document
export interface ICart extends Document {
  userId: IUser["_id"];
  productId: IProduct["_id"];
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

const CartSchema = new Schema<ICart>(
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
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    expiresAt: {
      type: Date,
      default: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        ["createdAt", "updatedAt", "expiresAt"].forEach((field) => {
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

// Compound index to prevent duplicate items in cart
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CartSchema.set("toJSON", { versionKey: false });

CartSchema.virtual("purchasedAt", {
  type: Date,
  ref: "Order",
  localField: "productId",
  foreignField: "items.productId",
});

const CartModel: Model<ICart> = models.Cart || model<ICart>("Cart", CartSchema);

export default CartModel;
