import { model, models, Schema } from "mongoose";
import User from "./user.model";
import Product from "./product.model";
const CartSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Cart must belong to a user."],
  },
  product: {
    type: Schema.ObjectId,
    ref: "Product",
    required: [true, "Cart must belong to a product."],
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

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
