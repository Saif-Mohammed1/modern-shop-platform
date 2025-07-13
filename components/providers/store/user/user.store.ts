// "use client";

import { signOut } from "next-auth/react";
import { create } from "zustand";
// import { persist } from "zustand/middleware";
import { subscribeWithSelector } from "zustand/middleware";

import type { UserAuthType } from "@/app/lib/types/users.db.types";
//import { deleteCookies } from "@/app/lib/utilities/cookies";
import tokenManager from "@/app/lib/utilities/TokenManager";

import { useCartStore } from "../cart/cart.store";
import { useWishlistStore } from "../wishlist/wishlist.store";

interface InitialState {
  user: UserAuthType | null;
}
// Define the initial state
const initialState: InitialState = {
  user: null,
};
export const useUserStore = create<InitialState>()(
  subscribeWithSelector(() => initialState)
);

export const updateUser = (newUser: UserAuthType | null) => {
  useUserStore.setState({ user: newUser });
};

export const logOutUser = async () => {
  await signOut();
  updateUser(null);
  useCartStore.setState({ cartItems: [] });
  useCartStore.persist.clearStorage();
  useWishlistStore.setState({ wishlist: { items: [], _id: "" } });
  tokenManager.clearAccessToken();
  //await deleteCookies("refreshAccessToken");
};
