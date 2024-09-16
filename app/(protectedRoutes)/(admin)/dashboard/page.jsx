import Dashboard from "@/components/shop/adminDashboard/dashboard";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import { headers } from "next/headers";

const page = async () => {
  const reqHeaders = headers();
  const customHeaders = {
    Authorization: "Bearer " + reqHeaders.get("Authorization") || "",
    "Content-Type": "application/json",
    "User-Agent": reqHeaders.get("user-agent") || "Unknown Device",
  };
  try {
    const {
      data: { data },
    } = await api.get("/admin/dashboard", { headers: customHeaders });
    return <Dashboard data={data} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
