// @ts-ignore
import { Model, Query, Schema, model, models } from "mongoose";
import User, { IUser } from "./User.model";
import Product, { IProduct } from "./Product.model";
import { Document } from "mongoose";
import {
  IShippingInfo,
  IItems,
  OrderStatus,
} from "@/app/lib/types/orders.types";

export interface IOrder extends Document {
  _id: Schema.Types.ObjectId;
  userId: IUser["_id"];
  shippingInfo: IShippingInfo;
  items: IItems[];
  status: OrderStatus;
  invoiceId: string;
  invoiceLink: string;
  totalPrice: number;
  // createdAt: Date;
  // updatedAt: Date;
}
const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,
      index: true,
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
          index: true,
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

      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
      index: true,
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
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_, ret) {
        ["createdAt", "updatedAt"].forEach((field) => {
          if (ret[field]) {
            ret[field] = new Date(ret[field]).toISOString().split("T")[0];
          }
        });
        return ret;
      },
    },
  }
);
OrderSchema.index({ createdAt: 1 });
OrderSchema.index({ userId: 1 });
OrderSchema.index({ "items._id": 1 });

// OrderSchema.index({ "items._id": 1 });
OrderSchema.pre<Query<any, IOrder>>(/^find/, function (next) {
  this.populate({
    path: "userId",
    select: "name email",
    model: User,
    options: { lean: true },
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

// comvert price to two decimal places
OrderSchema.set("toJSON", {
  versionKey: false,

  transform: function (_, ret) {
    ret.totalPrice = parseFloat(ret.totalPrice.toFixed(2));
    ret.items.forEach((item: any) => {
      item.price = parseFloat(item.price.toFixed(2));
      item.finalPrice = parseFloat(item.finalPrice.toFixed(2));
      if (item.discount) {
        item.discount = parseFloat(item.discount.toFixed(2));
      }
    });
    return ret;
  },
});
OrderSchema.post(/^find/, function (docs, next) {
  // Ensure `docs` is an array (it should be for `find`)
  if (Array.isArray(docs)) {
    // Filter out documents where `product` is null
    const filteredDocs = docs.filter((doc) => doc.userId !== null);
    // You cannot just replace `docs` with `filteredDocs`, as `docs` is what the caller receives
    // You would need to mutate `docs` directly if you need to change the actual array being passed back
    docs.splice(0, docs.length, ...filteredDocs);
  }
  next();
});
const OrderModel: Model<IOrder> =
  models.Order || model<IOrder>("Order", OrderSchema);

export default OrderModel;
