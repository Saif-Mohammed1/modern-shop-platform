import {
  Schema,
  model,
  models,
  type Document,
  type Model,
  type Types,
} from "mongoose";

// import type { IProduct } from "./Product.model";
import {
  type IOrderItem,
  type IShippingInfo,
  OrderStatus,
  PaymentsMethod,
} from "@/app/lib/types/orders.types";
import { UserCurrency } from "@/app/lib/types/users.types";

import type { IUser } from "./User.model";

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: IUser["_id"];
  items: IOrderItem[];
  shippingAddress: IShippingInfo;

  payment: {
    method: string;
    transactionId: string;
  };
  status: OrderStatus;
  invoiceId: string;
  invoiceLink: string;
  subtotal: number;
  // shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  orderNotes?: string[];
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0.01 },
        discount: { type: Number, default: 0, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        sku: { type: String, required: true },
        attributes: { type: Map, of: Schema.Types.Mixed },
        shippingInfo: {
          weight: { type: Number, min: 0 },
          dimensions: {
            length: { type: Number, min: 0 },
            width: { type: Number, min: 0 },
            height: { type: Number, min: 0 },
          },
        },
        finalPrice: { type: Number, required: true, min: 0.01 },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    payment: {
      method: {
        type: String,
        required: true,
        enum: Object.values(PaymentsMethod),
      },
      transactionId: { type: String, required: true },
      // status: {
      //   type: String,
      //   enum: Object.values(PaymentStatus),

      //   default: PaymentStatus.Pending,
      // },
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      // enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
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
    subtotal: { type: Number, required: true, min: 0 },
    // shippingCost: { type: Number, required: true, min: 0 },
    tax: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: {
      type: String,
      default: UserCurrency.UAH,
      enum: Object.values(UserCurrency),
    },
    orderNotes: [{ type: String }],
    cancellationReason: String,
    // refundStatus: { type: String, enum: ["requested", "processed", "denied"] },
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
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ "items.productId": 1 });
OrderSchema.index({ "payment.transactionId": 1 }, { unique: true });

// Virtuals
OrderSchema.virtual("userDetails", {
  ref: "User",
  localField: "userId",
  foreignField: "_id",
  justOne: true,
});

// Pre-save hook for price validation
OrderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + item.finalPrice * item.quantity,
      0
    );
    // this.total = this.subtotal + this.shippingCost + this.tax;
    this.total = this.subtotal + this.tax;
  }
  next();
});

const OrderModel: Model<IOrder> =
  models.Order || model<IOrder>("Order", OrderSchema);
export default OrderModel;
