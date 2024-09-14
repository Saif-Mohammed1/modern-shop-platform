import HomeComponent from "@/components/home/home";
import api from "@/components/util/axios.api";

export default async function Home() {
  try {
    const {
      data: { data },
    } = await api.get("/shop/home-page");
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
    throw error;
  }
}
