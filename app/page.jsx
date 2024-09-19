export const dynamic = "force-dynamic";
import ErrorHandler from "@/components/Error/errorHandler";
import HomeComponent from "@/components/home/home";
import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
export default async function Home() {
  try {
    const {
      data: { data },
    } = await api.get("/shop/home-page", {
      headers: headers(),
    });
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
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
}
