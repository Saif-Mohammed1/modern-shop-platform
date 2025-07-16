import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { CartItemsType } from "@/app/lib/types/cart.db.types";

interface InitialState {
  isCartOpen: boolean;
  cartItems: CartItemsType[];
}

const initialState: InitialState = {
  isCartOpen: false,
  cartItems: [],
};

export const useCartStore = create<InitialState>()(
  persist(() => initialState, {
    name: "cart-storage", // unique name
    // getStorage: () => localStorage, // (optional) by default the 'localStorage' is used
  })
);

export const toggleCart = () =>
  useCartStore.setState((state) => ({
    ...state,
    isCartOpen: !state.isCartOpen,
  }));
export const setIsCartOpen = (isOpen: boolean) =>
  useCartStore.setState((state) => ({
    ...state,
    isCartOpen: isOpen,
  }));
