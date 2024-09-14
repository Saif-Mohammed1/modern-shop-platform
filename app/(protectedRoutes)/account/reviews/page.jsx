import ReviewHistory from "@/components/customer/reviewHistory";
import api from "@/components/util/axios.api";

const page = async () => {
  try {
    const { data } = await api.get("/customer/reviews");

    const reviews = data.data;
    return <ReviewHistory reviewsList={reviews} />;
  } catch (error) {
    throw error;
  }
};

export default page;
