import CheckoutPage from "@/components/shop/checkout/checkout";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import { headers } from "next/headers";

const Page = async () => {
  const reqHeaders = headers();
  const customHeaders = {
    Authorization: "Bearer " + reqHeaders.get("Authorization") || "",
    "Content-Type": "application/json",
    // Add any other headers you need
  };
  try {
    const { data } = await api.get("/customer/address", {
      headers: customHeaders,
    });
    const address = data?.data;
    return <CheckoutPage address={address || []} />;

    //
  } catch (error) {
    throw new AppError(error.message, error.status);
    //     throw new AppError(error.message, error.status);
  }
};

export default Page;
