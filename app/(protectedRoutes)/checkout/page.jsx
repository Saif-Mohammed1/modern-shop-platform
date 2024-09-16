export const dynamic = "force-dynamic";
import CheckoutPage from "@/components/shop/checkout/checkout";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";

const Page = async () => {
  try {
    const { data } = await api.get("/customer/address");
    const address = data?.data;
    return <CheckoutPage address={address || []} />;

    //
  } catch (error) {
    return <ErrorHandler message={error.message} />;
    //     throw new AppError(error.message, error.status);
  }
};

export default Page;
