import ReviewHistory from "@/components/customer/reviewHistory";
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
    const { data } = await api.get("/customer/reviews", {
      headers: customHeaders,
    });

    const reviews = data.data;
    return <ReviewHistory reviewsList={reviews} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
