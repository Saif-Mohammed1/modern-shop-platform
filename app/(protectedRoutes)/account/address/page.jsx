export const dynamic = "force-dynamic";
import AddressBook from "@/components/customer/address/addressBook";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";

export const metadata = {
  title: "Address Page",
  description: "This page displays the address book for the customer.",
};

const page = async () => {
  try {
    const { data } = await api.get("/customer/address");
    const address = data.data;

    return <AddressBook addressList={address} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
