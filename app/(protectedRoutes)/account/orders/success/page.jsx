import OrderCompletedV2 from "@/components/shop/orders/orderCompletedPrushers";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import { headers } from "next/headers";

const page = async () => {
  const reqHeaders = headers();
  const customHeaders = {
    Authorization: "Bearer " + reqHeaders.get("Authorization") || "",
    "Content-Type": "application/json",
    // Add any other headers you need
  };
  try {
    const { data } = await api.get("/customer/orders/latest-order", {
      headers: customHeaders,
    });
    const order = data.data;
    return <OrderCompletedV2 order={order} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
