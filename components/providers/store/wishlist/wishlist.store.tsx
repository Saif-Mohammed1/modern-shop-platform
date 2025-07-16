"use client";

import { create } from "zustand";

// import type { ProductCartPick } from "@/app/lib/types/cart.db.types";
import type { WishlistType } from "@/app/lib/types/wishList.types";
// import api_client from "@/app/lib/utilities/api.client";

interface InitialState {
  wishlist: WishlistType;
}
const initialState: InitialState = {
  wishlist: { items: [], _id: "" },
};
export const useWishlistStore = create<InitialState>()(() => initialState);

export const isInWishlist = (id: string) => {
  return useWishlistStore
    .getState()
    .wishlist.items.some((item) => item._id === id);
};
