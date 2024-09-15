import AddressBook from "@/components/customer/address/addressBook";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";

export const metadata = {
  title: "My Address",
  description: "My Address Page",
};

const page = async () => {
  try {
    const { data } = await api.get(
      "/customer/address" //{
      // headers: headers(),
      //}
    );
    const address = data.data;

    return <AddressBook addressList={address} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
