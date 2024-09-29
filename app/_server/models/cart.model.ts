import { Document, Model, model, models, Schema } from "mongoose";
import User, { IUserSchema } from "./user.model";
import Product, { IProductSchema } from "./product.model";
import { lang } from "@/components/util/lang";
import { cartControllerTranslate } from "../_Translate/cartControllerTranslate";
export interface ICartSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUserSchema["_id"]; // Only store the ObjectId of the User
  product: IProductSchema["_id"]; // Only store the ObjectId of the Product
  quantity: number;
}
const CartSchema = new Schema<ICartSchema>({
  user: {
    type: Schema.Types.ObjectId,

    ref: "User",
    required: [true, cartControllerTranslate[lang].model.schema.user.required],
  },
  product: {
    type: Schema.Types.ObjectId,

    ref: "Product",
    required: [
      true,
      cartControllerTranslate[lang].model.schema.product.required,
    ],
  },
  quantity: { type: Number, default: 1 },
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
          ...doc.product._doc,
          quantity: doc.quantity,
          user: { _id: doc.user._id, name: doc.user.name },
        };

        return data;
      });

    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});

const Cart: Model<ICartSchema> =
  models.Cart || model<ICartSchema>("Cart", CartSchema);

export default Cart;
