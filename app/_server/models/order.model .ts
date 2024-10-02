// @ts-ignore
import { Model, Query, Schema, model, models } from "mongoose";
import User, { IUserSchema } from "./user.model";
import Product, { IProductSchema } from "./product.model";
import { Document } from "mongoose";

// import Address from "./address.model";
type status = "pending" | "completed" | "refunded" | "processing" | "cancelled";
interface IShippingInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
}
interface IItems {
  _id: IProductSchema["_id"];
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  discountExpire: Date;
}
export interface IOrderSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUserSchema["_id"];
  shippingInfo: IShippingInfo;
  items: IItems[];
  status: status;
  invoiceId: string;
  invoiceLink: string;
  totalPrice: number;
  createdAt: Date;
}
const OrderSchema = new Schema<IOrderSchema>({
  user: {
    type: Schema.Types.ObjectId,

    ref: "User",
    required: true,
  },
  shippingInfo: {
    street: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },

    country: {
      type: String,
      required: true,
    },
  },
  items: [
    {
      _id: {
        type: Schema.Types.ObjectId,

        ref: "Product",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      finalPrice: {
        type: Number,
        required: true,
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
    required: true,
  },
  invoiceLink: {
    type: String,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
OrderSchema.pre<Query<any, IOrderSchema>>(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email  ",
    model: User,
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
const Order: Model<IOrderSchema> =
  models.Order || model<IOrderSchema>("Order", OrderSchema);

export default Order;
