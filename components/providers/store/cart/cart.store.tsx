import toast from "react-hot-toast";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.types";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { useUserStore } from "../user/user.store";

import {
  clearCartInDB,
  fetchCartItemsFromDB,
  removeCartItemFromDB,
  saveCartToDB,
} from "./cartAction";

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
export const getCartItems = async () => {
  const { user } = useUserStore.getState();

  // Check if user is signed in
  if (user) {
    // Fetch cart items from the database
    return await fetchCartItemsFromDB();
    // useCartStore.setState({ cartItems: items });
    // return;
  }
  return useCartStore.getState().cartItems || [];
};

export const addToCartItems = async (
  product: ProductCartPick,
  quantityValue: number = 1
) => {
  const { user } = useUserStore.getState();

  try {
    useCartStore.setState((state) => {
      // check if the product already exists in the cart
      // if it does, update the quantity
      // if it doesn't, add the product to the cart
      // if the quantity is greater than 1, set it to that value
      const existing = state.cartItems.find((item) => item._id === product._id);
      if (existing) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === product._id
              ? // ? { ...item, quantity: item.quantity + quantityValue }
                {
                  ...item,
                  quantity:
                    quantityValue > 1 ? quantityValue : item.quantity + 1,
                }
              : item
          ),
        };
      }
      // if the product doesn't exist in the cart, add it
      return {
        ...state,
        cartItems: [
          ...state.cartItems,
          { ...product, quantity: quantityValue },
        ],
      };
    });
    if (user) {
      // User is signed in, store cart in DB
      await saveCartToDB(product._id, quantityValue);
    }
  } catch (error) {
    // Rollback on error
    const originalCart = await getCartItems();
    useCartStore.setState({ cartItems: originalCart });
    throw error;
  }
};
export const decrementCartItemQuantity = async (product: ProductCartPick) => {
  const { user } = useUserStore.getState();
  try {
    useCartStore.setState((state) => {
      // check if product exist in cart and quantity is greater than 1 then decrease quantity by 1
      const existingProduct = state.cartItems.find(
        (item) => item._id === product._id
      );
      if (!existingProduct) {
        return state;
      }
      // If quantity is greater than 1, decrease it by 1
      if (existingProduct.quantity > 1) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          ),
        };
      }
      return {
        ...state,
        cartItems: state.cartItems.filter((item) => item._id !== product._id),
      };
    });
    if (user) {
      // User is signed in, remove cart item from DB
      await removeCartItemFromDB(product);
    }
  } catch (error) {
    const originalCart = await getCartItems();
    useCartStore.setState({ cartItems: originalCart });
    throw error;
  }
};
export const clearProductFromCartItem = async (product: ProductCartPick) => {
  const { user } = useUserStore.getState();
  try {
    useCartStore.setState((state) => ({
      ...state,
      cartItems: state.cartItems.filter((item) => item._id !== product._id),
    }));
    if (user) {
      // User is signed in, clear cart item from DB
      await clearCartInDB(product);
    }
  } catch (error) {
    const originalCart = await getCartItems();
    useCartStore.setState({ cartItems: originalCart });
    throw error;
  }
};
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
// Get cart items (either from DB or localStorage)
export const loadCart = async () => {
  const { user } = useUserStore.getState();
  try {
    if (!user) {
      return;
    }
    const cartItems = await getCartItems();
    if (cartItems) {
      // Update the cart state with the fetched items
      useCartStore.setState({
        cartItems: cartItems,
      });
    }
  } catch (error) {
    toast.error(
      (error as Error)?.message || cartContextTranslate[lang].errors.global
    );
  }
};
