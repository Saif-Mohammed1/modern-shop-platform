import { Schema, model, models } from "mongoose";
import User from "./user.model";
import Review from "./review.model";
const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name must be required"],
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: [true, "category must be required"],

      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, "price must be required"],
      min: 0,
    },
    discount: {
      type: Number,
      // required: [true, "discount must be required"],
      default: 0,
      validate: {
        validator: function (discount) {
          const price = this.get("price");
          // Check if the discount is less than the price
          return discount < price;
        },
        message: "Discount must be less than price",
      },
      min: 0,
    },
    discountExpire: Date,

    // select: false,
    images: [
      {
        link: {
          type: String,
          required: [true, "link must be required"],
        },
        public_id: {
          type: String,
          required: [true, "public_id  must be required"],
        },
        _id: false, // Disable _id for images array
      },
    ],
    // required: [true, "public_id  must be required"],
    // select: false,
    // default: "",
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "Product must belong to a user."],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Product must have a description."],
    },
    stock: {
      type: Number,
      trim: true,
      required: [true, "Product must have a stock."],
      min: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Virtual populate
ProductSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});

// Populate user before executing the find query
ProductSchema.pre(/^find/, function (next) {
  // //console.log("worked populate");

  this.populate({
    path: "user",
    select: "name  _id",
  });
  next();
});

// Update discount and expire discounts before executing the find query doesn't work
// ProductSchema.pre(/^find/, async function (next) {
//   //console.log("worked updated");

//   try {
//     const currentDate = new Date();
//     this.find({ discountExpire: { $lt: currentDate } })
//       .updateMany({
//         $set: { discount: 0 },
//         $unset: { discountExpire: 1 },
//       })
//       ;
//     // Filter out documents where `product` is null
//     // this.where("user").ne(null);
//     // // Update discount if discountExpire is less than the current date
//     // this.where("discountExpire")
//     //   .lt(currentDate)
//     //   .updateMany({ $set: { discount: 0, discountExpire: undefined } });
//     // // // Execute the find query to get the updated documents
//     // // // const updatedDocuments =
//     this.find();
//     // Replace the original documents with the updated documents
//     // this.splice(0, this.length, ...updatedDocuments);
//     next();
//   } catch (error) {
//     next(error); // Pass any error to the next middleware
//   }
// });

// Set discount expiration date before saving the document
ProductSchema.pre("save", function (next) {
  // this points to the current query
  if (this.discount && this.discount > 0 && this.isNew) {
    // Default to 7 days from the current date
    this.discountExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});

ProductSchema.post(/^find/, async function (docs, next) {
  const currentDate = new Date();

  try {
    // Ensure `docs` is an array (it should be for `find`)
    if (!Array.isArray(docs)) {
      if (docs?.discountExpire && docs?.discountExpire < currentDate) {
        docs.discount = 0;

        docs.discountExpire = undefined;
        await docs.save();
      }
      return next();
    }

    // Filter out documents with null user and update discount if discountExpire is less than the current date
    const filteredDocs = docs.filter((doc) => doc.user !== null);
    const savePromises = filteredDocs.map(async (doc) => {
      if (docs?.discountExpire && doc?.discountExpire < currentDate) {
        doc.discount = 0;

        doc.discountExpire = undefined;
        await doc.save();
      }
    });

    // Wait for all save operations to complete
    await Promise.all(savePromises);
    // Replace the original documents array with the filtered and updated documents
    docs.splice(0, docs.length, ...filteredDocs);

    next();
  } catch (error) {
    next(error); // Pass any error to the next middleware
  }
});

// // Pre-save hook to set discount to 0 if discountExpire is less than current date
// ProductSchema.pre(/^find/, function (next) {
//   if (this.discountExpire < Date.now()) {
//     this.discount = 0;
//   }
//   next();
// });
// ProductSchema.pre(/^find/, async function (next) {
//   const doc = this;
//   const price = await doc.get("price");
//   const discount = await doc.get("discount");
//   ////console.log("guess what");
//   if (discount > price) {
//     throw new Error("Discount must be less than price");
//   }

//   next();
// });

const Product = models.Product || model("Product", ProductSchema);

export default Product;
