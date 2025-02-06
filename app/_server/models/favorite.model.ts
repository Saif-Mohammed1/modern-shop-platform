// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import Product, { IProductSchema } from "./product.model";
export interface IFavoriteSchema extends Document {
  user: IUserSchema["_id"];
  product: IProductSchema["_id"];
  // favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const FavoriteSchema = new Schema<IFavoriteSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,

      ref: "Product",
      required: true,
      index: true,
    },
    // favorite: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  {
    timestamps: true,
  }
);
// Index the `product` field
// FavoriteSchema.index({ product: 1 });

FavoriteSchema.pre<Query<any, IFavoriteSchema>>(/^find/, function (next) {
  this.populate({
    path: "product",
    model: Product,
    // select: "name price",
  }).populate({
    path: "user",
    select: "name email",
    model: User,
  });
  next();
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
const Favorite: Model<IFavoriteSchema> =
  models.Favorite || model<IFavoriteSchema>("Favorite", FavoriteSchema);

export default Favorite;
