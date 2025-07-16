import { gql, useMutation } from "@apollo/client";
import toast from "react-hot-toast";

import type { ProductCartPick } from "@/app/lib/types/cart.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";

import { useUserStore } from "../user/user.store";

import { isInWishlist, useWishlistStore } from "./wishlist.store";



const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($id: String!) {
    toggleWishlist(id: $id) {
      success
      message
      added
    }
  }
`;
// ✅ Custom hook to toggle wishlist
export const useToggleWishlist = () => {
  //   const { user } = useUserStore();
  const { user } = useUserStore.getState();

  const [toggleWishlistMutation] = useMutation(TOGGLE_WISHLIST);

  const toggleWishlist = async (product: ProductCartPick) => {
    if (!user) {
      return;
    }

    const exists = isInWishlist(product._id);

    try {
      // 1. Perform the toggle mutation
      await toggleWishlistMutation({ variables: { id: product._id } });

      // 2. Optimistically update Zustand state
      useWishlistStore.setState((state) => ({
        wishlist: {
          ...state.wishlist,
          items: exists
            ? state.wishlist.items.filter((item) => item._id !== product._id)
            : [...state.wishlist.items, product],
        },
      }));

      // 3. Show toast
      toast.success(
        exists
          ? accountWishlistTranslate[lang].WishListCard.functions
              .handleWishlistClick.removed
          : accountWishlistTranslate[lang].WishListCard.functions
              .handleWishlistClick.success
      );
    } catch (error) {
      // 4. Show error and rollback state
      toast.error(
        error instanceof Error
          ? error.message
          : accountWishlistTranslate[lang].errors.global
      );

      useWishlistStore.setState((state) => ({
        wishlist: {
          ...state.wishlist,
          items: exists
            ? [...state.wishlist.items, product]
            : state.wishlist.items.filter((item) => item._id !== product._id),
        },
      }));
    }
  };

  return { toggleWishlist };
};
