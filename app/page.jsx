import HomeComponent from "@/components/home/home";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
export default async function Home() {
  const reqHeaders = headers();
  const customHeaders = {
    Authorization: "Bearer " + reqHeaders.get("Authorization") || "",
    "Content-Type": "application/json",
    // Add any other headers you need
  };
  try {
    const {
      data: { data },
    } = await api.get("/shop/home-page", { headers: customHeaders });
    const topOfferProducts = data.topOfferProducts;
    const newProducts = data.newProducts;
    const topRating = data.topRating;

    return (
      <HomeComponent
        topOfferProducts={topOfferProducts}
        newProducts={newProducts}
        topRating={topRating}
      />
    );
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
}
