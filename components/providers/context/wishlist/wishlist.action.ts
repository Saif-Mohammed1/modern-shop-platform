import type { WishlistType } from "@/app/lib/types/wishList.types";
import api from "@/app/lib/utilities/api";

export const getMyWishList = async (): Promise<WishlistType[] | []> => {
  const {
    data: { docs },
  }: { data: { docs: WishlistType[] } } = await api.get("/customers/wishlist");
  return docs || [];
};
