import { Schema, model, models } from "mongoose";
import User from "./user.model";
// import Address from "./address.model";
const OrderSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
    required: [true, "Order must belong to a user."],
  },
  shippingInfo: {
    street: {
      type: String,
      required: [true, "Please add a street"],
    },
    city: {
      type: String,
      required: [true, "Please add a city"],
    },
    state: {
      type: String,
      required: [true, "Please add a state"],
    },
    postalCode: {
      type: String,
      required: [true, "Please add a postalCode"],
    },
    phone: {
      type: String,
      required: [true, "Please add a phone"],
    },

    country: {
      type: String,
      required: [true, "Please add a country"],
    },
  },
  items: [
    {
      _id: {
        type: Schema.ObjectId,
        ref: "Product",
        required: [true, "Please add a product id"],
      },
      name: {
        type: String,
        required: [true, "Please add a product name"],
      },
      quantity: {
        type: Number,
        required: [true, "Please add a product quantity"],
      },
      price: {
        type: Number,
        required: [true, "Please add a product price"],
      },
      discount: {
        type: Number,
        default: 0,
      },
      finalPrice: {
        type: Number,
        required: [true, "Please add a product finalPrice"],
      },
      discountExpire: Date,
    },
  ],
  status: {
    type: String,
    // required: true,

    enum: ["pending", "completed", "refunded", "processing", "cancelled"],
    default: "pending",
  },
  invoiceId: {
    type: String,
    required: [true, "Invoice ID field is required."],
  },
  invoiceLink: {
    type: String,
    required: [true, "Invoice Link field is required."],
  },
  totalPrice: {
    type: Number,
    required: [true, "totalPrice field is required."],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
OrderSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
  });
  //.populate({
  //   path: "shippingInfo",
  // });

  // this.populate({
  //   path: "user",
  //   select: "name photo",
  // });
  next();
});

OrderSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter((doc) => doc.user !== null);
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const Order = models.Order || model("Order", OrderSchema);

export default Order;
