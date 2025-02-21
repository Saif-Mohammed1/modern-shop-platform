import { Schema, model, models, Document, Model, Types } from "mongoose";
import ReviewModel, { IReview } from "./Review.model";
import { IUser } from "./User.model";
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  price: number;
  discount: number;
  discountExpire?: Date;
  images: { link: string; public_id: string }[];
  userId: IUser["_id"];
  description: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  active: boolean;
  slug: string;
  reserved: number;
  lastReserved?: Date;
  sold: number;
  sku: string;
  attributes: Record<string, any>;
  shippingInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      maxlength: 120,
      index: true,
    },
    category: {
      type: String,
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
      set: (v: number) => Math.round(v * 100) / 100, // Store as cents to avoid floating point issues
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
      // max: [100, "Discount cannot exceed 100%"],
    },
    discountExpire: {
      type: Date,
      index: true,
    },
    images: [
      {
        link: { type: String, required: true },
        public_id: { type: String, required: true },
        _id: false,
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 50,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      set: (v: number) => Math.floor(v),
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
      set: (v: number) => Math.round(v * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    sold: {
      type: Number,
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    shippingInfo: {
      weight: { type: Number, min: 0 },
      dimensions: {
        length: { type: Number, min: 0 },
        width: { type: Number, min: 0 },
        height: { type: Number, min: 0 },
      },
    },
  },

  {
    timestamps: true,
    // toJSON: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        // ret.id = ret._id;
        // delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
    versionKey: false,
  }
);

// Indexes
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ category: 1, price: 1, ratingsAverage: -1 });
ProductSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 3, description: 1 } }
);
// Virtuals
ProductSchema.virtual("discountedPrice").get(function () {
  return this.price * (1 - this.discount / 100);
});

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "productId",
  // options: { sort: { createdAt: -1 }, limit: 10 },
});
ProductSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name.toLowerCase().trim().split(" ").join("-");
  }
  next();
});
const ProductModel: Model<IProduct> =
  models.Product || model<IProduct>("Product", ProductSchema);

export default ProductModel;
