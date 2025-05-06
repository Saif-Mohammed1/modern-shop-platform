"use client";

import toast from "react-hot-toast";
import { create } from "zustand";

import type { ProductType } from "@/app/lib/types/products.types";
import type { WishlistType } from "@/app/lib/types/wishList.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { useUserStore } from "@/components/providers/store/user/user.store";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";

import { getMyWishList } from "./wishlist.action";
interface InitialState {
  wishlist: WishlistType;
}
const initialState: InitialState = {
  wishlist: { items: [], userId: "" },
};
export const useWishlistStore = create<InitialState>()(() => initialState);

export const isInWishlist = (id: string) => {
  return useWishlistStore
    .getState()
    .wishlist.items.some((item) => item.productId._id === id);
};

export const loadWishlist = async () => {
  const { user } = useUserStore.getState();

  if (user) {
    try {
      const data = await getMyWishList();
      useWishlistStore.setState({ wishlist: data });
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountWishlistTranslate[lang].wishListContext.loadWishlist.error
        );
      } else {
        toast.error(accountWishlistTranslate[lang].errors.global);
      }
      useWishlistStore.setState({
        wishlist: {
          items: [],
          userId: "",
        },
      });
    }
  }
};

export const toggleWishlist = async (product: ProductType) => {
  const { user } = useUserStore.getState();

  if (user) {
    try {
      const exists = useWishlistStore
        .getState()
        .wishlist.items.some((item) => item.productId._id === product._id);
      if (exists) {
        useWishlistStore.setState((state) => ({
          ...state,
          wishlist: {
            ...state.wishlist,
            items: state.wishlist.items.filter(
              (item) => item.productId._id !== product._id
            ),
          },
        }));
        // Remove from wishlist
        await api.post(`/customers/wishlist/${product._id}`);

        toast.success(
          accountWishlistTranslate[lang].WishListCard.functions
            .handleWishlistClick.removed
        );
      } else {
        // Add to wishlist
        useWishlistStore.setState((state) => ({
          ...state,
          wishlist: {
            ...state.wishlist,

            items: [
              ...state.wishlist.items,

              {
                productId: product,
              },
            ],
          },
        }));

        await api.post(`/customers/wishlist/${product._id}`);
        toast.success(
          accountWishlistTranslate[lang].WishListCard.functions
            .handleWishlistClick.success
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(accountWishlistTranslate[lang].errors.global);
      }
      const originalWishList = await getMyWishList();
      useWishlistStore.setState({ wishlist: originalWishList });
      throw error;
    }
  }
};
