import api from "@/app/lib/utilities/api";

export const getMyWishList = async () => {
  try {
    const {
      data: { docs },
    } = await api.get("/customers/wishlist");
    return docs || [];
  } catch (error: unknown) {
    throw error;
    // if (error instanceof Error) {
    //   return error.message ||
    //     accountWishlistTranslate[lang].wishListContext.loadWishlist.error;
    // }
  }
};
