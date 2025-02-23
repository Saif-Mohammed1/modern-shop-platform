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
export interface IItems {
  _id: IProduct["_id"];
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  discountExpire: Date;
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

export type OrderType = {
  _id: string;
  shippingInfo: IShippingInfo;
  user: Partial<UserAuthType>;
  items: IItems[];
  status: OrderStatus;
  invoiceId: string;
  invoiceLink: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};
