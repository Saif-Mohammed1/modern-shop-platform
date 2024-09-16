import AddressBook from "@/components/customer/address/addressBook";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import { headers } from "next/headers";

export const metadata = {
  title: "Address Page",
  description: "This page displays the address book for the customer.",
};

const page = async () => {
  const reqHeaders = headers();
  const customHeaders = {
    Authorization: `Bearer ${reqHeaders.get("Authorization") || ""}`,
    "Content-Type": "application/json",
    "User-Agent": reqHeaders.get("user-agent") || "Unknown Device",
  };
  try {
    const { data } = await api.get("/customer/address", {
      headers: customHeaders,
    });
    const address = data.data;

    return <AddressBook addressList={address} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
