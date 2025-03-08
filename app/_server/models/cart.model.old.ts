// @ts-ignore
import { Document, Model, model, models, Query, Schema } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProductSchema } from "./Product.model";

export interface ICartSchema extends Document {
  user: IUser["_id"]; // Only store the ObjectId of the User
  product: IProductSchema["_id"]; // Only store the ObjectId of the Product
  quantity: number;
  // createdAt: Date;
  // updatedAt: Date;
}
const CartSchema = new Schema<ICartSchema>(
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
    quantity: { type: Number, default: 1 },
  },
  { timestamps: true }
);
// CartSchema.index({ product: 1 });
CartSchema.pre<Query<any, ICartSchema>>(/^find/, function (next) {
  this.populate({
    path: "product",
    // select: "name price images category slug",
    model: Product,
    options: { lean: true },
  }).populate({
    path: "user",
    select: "name -_id",
    model: User,
    options: { lean: true },
  });

  next();
});
CartSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs
      .filter(
        (doc) => doc.product !== null && typeof doc.product !== "undefined"
      )
      .map((doc) => {
        // Append the quantity to the product object

        const data = {
          ...doc.product, //  This will not work because `doc.product` is a lean object and not a mongoose document
          quantity: doc.quantity,
          // user: { _id: doc.user._id, name: doc.user.name },
        };
        //  const data = {
        //    ...doc.product._doc, // ❌ This will not work because `_doc` does not exist on `doc.product` becusae it is a lean object and not a mongoose document
        //    quantity: doc.quantity,
        //    user: { _id: doc.user._id, name: doc.user.name },
        //  };

        return data;
      });

    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});

const Cart: Model<ICartSchema> =
  models.Cart || model<ICartSchema>("Cart", CartSchema);

export default Cart;
