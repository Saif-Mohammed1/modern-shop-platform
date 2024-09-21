import OrderCancellation from "@/components/shop/orders/cancellingReason";
export const metadata = {
  title: "Order Cancellation",
  description: "Order Cancellation for the customer",
  keywords: "customer, order cancellation, customer order cancellation",
};
const page = () => {
  return <OrderCancellation />;
};

export default page;
