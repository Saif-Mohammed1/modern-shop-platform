import type { WishlistType } from "@/app/lib/types/wishList.types";
import api_client from "@/app/lib/utilities/api.client";
export const getMyWishList = async (): Promise<WishlistType> => {
  const { data }: { data: WishlistType } = await api_client.get(
    "/customers/wishlist"
  );
  return (
    data || {
      items: [],
      _id: "",
    }
  );
};
