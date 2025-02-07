export enum OrderStatus {
  pending = "pending",
  completed = "completed",
  refunded = "refunded",
  processing = "processing",
  cancelled = "cancelled",
}
export type OrderType = {
  _id: string;
  shippingInfo: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  status: OrderStatus;
};
