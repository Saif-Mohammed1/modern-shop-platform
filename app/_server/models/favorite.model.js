import { Schema, model, models } from "mongoose";
import User from "./user.model";
import Product from "./product.model";
const FavoriteSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Product must belong to a user."],
  },
  product: {
    type: Schema.ObjectId,
    ref: "Product",
    required: [true, "Product must belong to a product."],
  },
  // favorite: {
  //   type: Boolean,
  //   default: true,
  // },
});
FavoriteSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter((doc) => doc.product !== null);
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const Favorite = models.Favorite || model("Favorite", FavoriteSchema);

export default Favorite;
