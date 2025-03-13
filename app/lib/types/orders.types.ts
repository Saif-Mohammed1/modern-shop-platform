import { IProduct } from "../../_server/models/Product.model";
import { UserAuthType } from "./users.types";
// import Address from "./address.model";
// export type status = "pending" | "completed" | "refunded" | "processing" | "cancelled";
export interface IShippingInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
}
// export interface IItems {
//   _id: IProduct["_id"];
//   name: string;
//   quantity: number;
//   price: number;
//   discount: number;
//   finalPrice: number;
//   discountExpire: Date;
// }
export interface IOrderItem {
  productId: IProduct["_id"];
  name: string;
  price: number;
  discount: number;
  quantity: number;
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
  finalPrice: number;
}
export enum OrderStatus {
  Pending = "pending", // Order placed, waiting for confirmation/payment
  Processing = "processing", // Payment confirmed, preparing order
  Shipped = "shipped", // Order has been shipped
  Delivered = "delivered", // Order delivered to customer
  Completed = "completed", // Order successfully completed
  Cancelled = "cancelled", // Order cancelled before shipment
  Refunded = "refunded", // Order refunded to customer
  Failed = "failed", // Payment failed or issue occurred
  OnHold = "on_hold", // Order put on hold for verification/issues
  PartiallyRefunded = "partially_refunded", // Part of the order refunded
  Disputed = "disputed", // Customer has raised a dispute
}
// ["credit_card", "paypal", "crypto"],
export enum PaymentsMethod {
  Credit_card = "credit_card",
  Paypal = "paypal",
  // Credit_card=""
}
export type OrderType = {
  _id: string;
  shippingAddress: IShippingInfo;
  userId: Partial<UserAuthType>;
  items: IOrderItem[];
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
  // totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};
