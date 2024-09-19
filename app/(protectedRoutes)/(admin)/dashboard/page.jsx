export const dynamic = "force-dynamic";
import Dashboard from "@/components/shop/adminDashboard/dashboard";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";

const page = async () => {
  try {
    const {
      data: { data },
    } = await api.get("/admin/dashboard", {
      headers: headers(),
    });
    return <Dashboard data={data} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
