// @ts-ignore
import { Document, Model, Query, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import Review from "./review.model";

export interface IProductSchema extends Document {
  _id: Schema.Types.ObjectId;
  name: string;
  category: string;
  price: number;
  discount: number;
  discountExpire?: Date;
  images: { link: string; public_id: string }[];
  user: IUserSchema["_id"] | null;
  description: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  slug: string;
}

const ProductSchema = new Schema<IProductSchema>(
  {
    name: {
      type: String,

      required: true,

      trim: true,
      lowercase: true,
    },
    category: {
      type: String,

      required: true,

      trim: true,
      lowercase: true,
      index: true,
    },
    price: {
      type: Number,

      required: true,

      min: 1,
      index: true,
    },
    discount: {
      type: Number,
      default: 0,
      validate: {
        validator: function (discount: number) {
          const price = this.get("price") as number;
          // Check if the discount is less than the price
          return discount < price;
        },
        message: "{VALUE} must be less than the price",
        type: "discountValidation", // Custom error type
      },
      min: 0,
    },
    discountExpire: Date,

    // select: false,
    images: [
      {
        link: {
          type: String,

          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        _id: false, // Disable _id for images array
      },
    ],
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },
    description: {
      type: String,
      trim: true,
      // [
      required: true,
    },
    stock: {
      type: Number,
      trim: true,

      required: true,

      min: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,

      max: 5,

      set: (val: number) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
      index: true,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    // createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// By Indexing the price field, we can improve the performance of the queries that use the price field in the find method.
// Virtual populate
ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});
ProductSchema.set("toJSON", {
  transform: function (_, ret) {
    //  return price or descount to 2 decimal places for example 10.9999 will be 10.99
    if (ret.price) {
      ret.price = parseFloat(ret.price.toFixed(2));
    }
    if (ret.discount) {
      ret.discount = parseFloat(ret.discount.toFixed(2));
    }
    ret._id = ret._id.toString();
    return ret;
  },
});
// Populate user before executing the find query
ProductSchema.pre<Query<any, IProductSchema>>(/^find/, function (next) {
  this.populate({
    path: "user",
    // select: "name email",
    select: "name",
    model: User,
  });
  next();
});

ProductSchema.pre("save", function (next) {
  // this points to the current query
  if (this.discount && this.discount > 0 && this.isNew) {
    // Default to 7 days from the current date
    this.discountExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name.toLowerCase().split(" ").join("-");
  }
  next();
});

ProductSchema.post(/^find/, async function (docs: IProductSchema[], next) {
  const currentDate = new Date();

  try {
    // Check and update all documents in one go for expired discounts
    await Product.updateMany(
      { discountExpire: { $lt: currentDate } },
      { $set: { discount: 0 }, $unset: { discountExpire: "" } }
    );

    // If `docs` is an array (it should be for `find`), filter it
    if (Array.isArray(docs)) {
      const filteredDocs = docs.filter((doc) => doc.user !== null);
      // Optionally perform additional actions with filteredDocs
      docs.splice(0, docs.length, ...filteredDocs);
    }

    next();
  } catch (error) {
    next(error as Error); // Pass any error to the next middleware
  }
});

const Product: Model<IProductSchema> =
  models.Product || model<IProductSchema>("Product", ProductSchema);

export default Product;
