export const dynamic = "force-dynamic";
import ReviewHistory from "@/components/customer/reviewHistory";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";

const page = async () => {
  try {
    const { data } = await api.get("/customer/reviews", {
      headers: headers(),
    });
    const reviews = data.data;
    return <ReviewHistory reviewsList={reviews} />;
  } catch (error) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
