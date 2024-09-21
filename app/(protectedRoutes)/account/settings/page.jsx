export const dynamic = "force-dynamic";
import ChangePassword from "@/components/customer/changePassword";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
export const metadata = {
  title: "Change Password",
  description: "Change Password for the customer",
  keywords: "customer, change password, customer change password",
};
const page = async () => {
  try {
    const { data } = await api.get("/customer/device-info", {
      headers: headers(),
    });
    const deviceInfo = data.data;
    return <ChangePassword devices={deviceInfo} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;
    // throw new AppError(error.message, error.status);
  }
};

export default page;
