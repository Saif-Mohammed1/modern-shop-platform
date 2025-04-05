"use client";

import { createContext, use, useEffect, useState } from "react";
import toast from "react-hot-toast";

import type {
  CartContextType,
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.types";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { useUser } from "../user/user.context";

import {
  addToCart,
  clearItemFromCart,
  // mergeLocalCartWithDB,
  getCartItems,
  removeFromCart,
} from "./cartAction";

// Create the cart context
export const CartContext = createContext<CartContextType>({
  isCartOpen: false,
  toggleCartStatus: () => {},
  cartItems: [],
  addToCartItems: async () => {},
  removeCartItem: async () => {},
  setIsCartOpen: () => {},
  clearProductFromCartItem: async () => {},
});

// Create a CartProvider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Define the state for the cart
  const [cartItems, setCartItems] = useState<CartItemsType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const { user } = useUser();

  const addToCartItems = async (
    product: ProductCartPick,
    quantityValue: number = 1
  ) => {
    try {
      setCartItems((prev) => {
        const existing = prev.find((item) => item._id === product._id);
        if (existing) {
          return prev.map((item) =>
            item._id === product._id
              ? {
                  ...item,
                  quantity:
                    quantityValue > 1 ? quantityValue : item.quantity + 1,
                }
              : item
          );
        }
        return [...prev, { ...product, quantity: quantityValue }];
      });
      await addToCart(product, user, quantityValue);
      const updatedCart = await getCartItems(user);
      setCartItems(updatedCart);
    } catch (error) {
      // Rollback on error
      const originalCart = await getCartItems(user);
      setCartItems(originalCart);
      throw error;
    }
  };
  const removeCartItem = async (product: ProductCartPick) => {
    try {
      setCartItems((pre) => {
        //  check if product exist in cart and quantity is greater than 1 then decrease quantity by 1
        const existingProduct = pre.find((item) => item._id === product._id);
        if (existingProduct && existingProduct.quantity > 1) {
          return pre.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
        return pre.filter((item) => item._id !== product._id);
      });
      await removeFromCart(product, user);
      // setCartItems(data);
    } catch (error) {
      const originalCart = await getCartItems(user);
      setCartItems(originalCart);
      throw error;
    }
  };
  const clearProductFromCartItem = async (product: ProductCartPick) => {
    try {
      setCartItems((pre) => pre.filter((item) => item._id !== product._id));
      await clearItemFromCart(product, user);
    } catch (error) {
      const originalCart = await getCartItems(user);
      setCartItems(originalCart);
      throw error;
    }
  };
  const toggleCartStatus = () => {
    setIsCartOpen(!isCartOpen);
  };

  useEffect(() => {
    let isMounted = true;
    const loadCart = async () => {
      try {
        const data = await getCartItems(user);
        if (isMounted) setCartItems(data);
      } catch (error: any) {
        if (isMounted)
          toast.error(
            error?.message || cartContextTranslate[lang].errors.global
          );
      }
    };
    // Add small delay if experiencing race conditions
    const timer = setTimeout(() => void loadCart(), 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user]);

  // Sync local storage
  useEffect(() => {
    if (!user) localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems, user]);

  // Merge carts with cleanup
  // useEffect(() => {
  //   let isMounted = true;
  //   const mergeCarts = async () => {
  //     const storedCart = localStorage.getItem("cart") || [];
  //     if (storedCart?.length && user) {
  //       try {
  //         await mergeLocalCartWithDB();
  //         if (isMounted)
  //           toast.success(
  //             cartContextTranslate[lang].cartContext.mergeLocalCart.success //"Cart merged successfully"
  //           );
  //       } catch (error: any) {
  //         if (isMounted)
  //           toast.error(
  //             error?.message || cartContextTranslate[lang].errors.global
  //           );
  //       }
  //     }
  //   };
  //   mergeCarts();
  //   return () => {
  //     isMounted = false;
  //   };
  // }, [user]);

  return (
    <CartContext
      value={{
        cartItems,
        toggleCartStatus,
        setIsCartOpen,
        isCartOpen,
        addToCartItems,
        removeCartItem,
        clearProductFromCartItem,
      }}
    >
      {children}
    </CartContext>
  );
};
export const useCartItems = () => use(CartContext);
