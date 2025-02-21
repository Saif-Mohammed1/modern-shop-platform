// @ts-ignore
import { Document, Model, model, models, Schema } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";

// Interface for Cart document
export interface ICart extends Document {
  userId: IUser["_id"];
  productId: IProduct["_id"];
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
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
      required: true,
      min: [1, "Quantity cannot be less than 1"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to prevent duplicate items in cart
CartSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Validation to ensure product exists when adding to cart
CartSchema.pre<ICart>("save", async function (next) {
  const product = await Product.findById(this.productId);
  if (!product || product.stock < this.quantity) {
    throw new Error(
      !product ? "Product not found" : "Insufficient product stock"
    );
  }
  next();
});

const CartModel: Model<ICart> = models.Cart || model<ICart>("Cart", CartSchema);

export default CartModel;
