import CheckoutPage from "@/components/shop/checkout/checkout";
import api from "@/components/util/axios.api";

const Page = async () => {
  try {
    const { data } = await api.get("/customer/address");
    const address = data?.data;
    return <CheckoutPage address={address || []} />;

    //
  } catch (error) {
    throw error;
    // throw error;
  }
};

export default Page;
