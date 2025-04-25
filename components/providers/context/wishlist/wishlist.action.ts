import type { WishlistType } from "@/app/lib/types/wishList.types";
import api from "@/app/lib/utilities/api";

export const getMyWishList = async (): Promise<WishlistType> => {
  const { data }: { data: WishlistType } = await api.get("/customers/wishlist");
  return (
    data || {
      items: [],
      userId: "",
    }
  );
};
