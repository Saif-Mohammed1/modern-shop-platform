import OrderCompletedV2 from "@/components/shop/orders/orderCompletedPrushers";
import api from "@/components/util/axios.api";

const page = async () => {
  try {
    const { data } = await api.get("/customer/orders/latest-order");
    const order = data.data;
    return <OrderCompletedV2 order={order} />;
  } catch (error) {
    console.log(error);
    return <div>error</div>;
    throw error;
  }
};

export default page;
