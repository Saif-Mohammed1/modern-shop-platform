import api from "@/app/lib/utilities/api";

export const getMyWishList = async () => {
  const {
    data: { docs },
  } = await api.get("/customers/wishlist");
  return docs || [];
};
