import type { UserAuthType } from "./users.db.types";

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
export interface IOrderDB {
  _id: string;
  user_id: string;

  payment: {
    method: string;
    transaction_id: string;
  };
  status: OrderStatus;
  invoice_id: string;
  invoice_link: string;
  subtotal: number;
  // shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  order_notes?: string[];
  cancellation_reason?: string;
  created_at: Date;
  updated_at: Date;
}
export interface IOrderItemDB {
  _id: string;
  order_id: string;
  product_id: string;
  name: string;
  price: number;
  discount: number;
  quantity: number;
  sku: string;
  shipping_info_weight: number;
  shipping_info_dimensions: { length: number; width: number; height: number };

  final_price: number;
}
export interface IOrderShippingAddressDB {
  _id: string;
  order_id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country: string;
}

// import Address from "./address.model";
// export type status = "pending" | "completed" | "refunded" | "processing" | "cancelled";
export interface IShippingInfo {
  _id: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string;
  country: string;
}

// ["credit_card", "paypal", "crypto"],
export enum PaymentsMethod {
  Credit_card = "credit_card",
  Paypal = "paypal",
  // Credit_card=""
}
export type OrderType = {
  _id: string;
  shipping_address: IShippingInfo;
  user_id: Partial<UserAuthType>;
  items: IOrderItemDB[];
  status: OrderStatus;
  invoice_id: string;
  invoice_link: string;
  subtotal: number;
  payment: {
    method: string;
    transaction_id: string;
  };
  // shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  order_notes?: string[];
  cancellation_reason?: string;
  // totalPrice: number;
  created_at: Date;
  updated_at: Date;
};
