import ReviewHistory from "@/components/customer/reviewHistory";
import api from "@/components/util/axios.api";
import AppError from "@/components/util/appError";

const page = async () => {
  try {
    const { data } = await api.get("/customer/reviews");

    const reviews = data.data;
    return <ReviewHistory reviewsList={reviews} />;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

export default page;
