export const dynamic = "force-dynamic";
import ErrorHandler from "@/components/Error/errorHandler";
import OrderHistory from "@/components/shop/orders/orderHistory";
import AppError from "@/components/util/appError";
// import UserOrderTracking from "@/components/shop/orders/orderTracking";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";

const page = async () => {
  try {
    const { data } = await api.get("/customer/orders", {
      headers: headers(),
    });
    const orders = data.data;
    // return <OrderHistory ordersList={orders} />;
    return (
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          Track Your Order
        </h1>
        <div className="max-h-[80vh] overflow-y-auto">
          <OrderHistory ordersList={orders} />;
          {/* {orders.map((order) => (
            <UserOrderTracking order={order} />
          ))} */}
        </div>
      </div>
    );
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};
export default page;
