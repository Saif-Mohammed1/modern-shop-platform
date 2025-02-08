import { IProductSchema } from "../_server/models/product.model";
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
  _id: IProductSchema["_id"];
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  discountExpire: Date;
}
export enum OrderStatus {
  pending = "pending",
  completed = "completed",
  refunded = "refunded",
  processing = "processing",
  cancelled = "cancelled",
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
