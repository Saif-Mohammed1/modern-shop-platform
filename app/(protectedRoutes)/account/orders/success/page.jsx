export const dynamic = "force-dynamic";
import OrderCompletedV2 from "@/components/shop/orders/orderCompletedPrushers";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";

const page = async () => {
  try {
    const { data } = await api.get("/customer/orders/latest-order");
    const order = data.data;
    return <OrderCompletedV2 order={order} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
