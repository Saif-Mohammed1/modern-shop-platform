"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  clearItemFromCart,
  mergeLocalCartWithDB,
  updateCartQuantity,
} from "./cartAction";
import toast from "react-hot-toast";
import { ProductType } from "@/app/lib/types/products.types";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { useUser } from "../user/user.context";
import { CartContextType, CartItemsType } from "@/app/lib/types/cart.types";

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
  // Function to update the cart
  // const addToCartItems = async (
  //   product: ProductType,
  //   quantityValue: number = 1
  // ) => {
  //   try {
  //     await addToCart(product, user, quantityValue);

  //     setCartItems((pre) => {
  //       const existingProduct = pre.find((item) => item._id === product._id);

  //       if (existingProduct) {
  //         // If the product already exists, update its quantity
  //         return pre.map((item) =>
  //           item._id === product._id
  //             ? {
  //                 ...item,
  //                 quantity:
  //                   quantityValue > 1 ? quantityValue : item.quantity  1,
  //               }
  //             : item
  //         );
  //       } else {
  //         // If the product doesn't exist, add it to the cart
  //         return [...pre, { ...product, quantity: 1 }];
  //       }
  //     });
  //     // toast.success("Product added to cart");
  //   } catch (error) {
  //     throw error;
  //     // toast.error(error?.message || "Failed to add to cart");
  //   }
  // };
  // In CartProvider
  const addToCartItems = async (
    product: ProductType,
    quantityValue: number = 1
  ) => {
    try {
      // Optimistic update first
      // const quantity=Math.max(1,quantityValue)

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
  const removeCartItem = async (product: ProductType) => {
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
      const data = await removeFromCart(product, user);
      // setCartItems(data);
    } catch (error) {
      const originalCart = await getCartItems(user);
      setCartItems(originalCart);
      throw error;
    }
  };
  const clearProductFromCartItem = async (product: ProductType) => {
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
  // const updateQuantity = async (productId: string, quantity: number) => {
  //   try {
  //     const existingProduct = cartItems.find((item) => item._id === productId);
  //     if (existingProduct && existingProduct.stock <= quantity) {
  //       if (user) await updateCartQuantity(productId, quantity);
  //       // check if existing product quanty is less or equal  product stock

  //       setCartItems((prev) =>
  //         prev.map((item) =>
  //           item._id === productId ? { ...item, quantity } : item
  //         )
  //       );
  //     } else {
  //       throw new Error("Quantity exceeds available stock");
  //     }
  //   } catch (error) {
  //     // toast.error("Failed to update quantity");
  //     throw error;
  //   }
  // };
  useEffect(() => {
    const loadCart = async () => {
      try {
        if (user) {
          const data = await getCartItems(user);

          setCartItems(data);
        } else {
          const storedCart = await getCartItems(null);

          setCartItems(storedCart);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(
            error?.message ||
              cartContextTranslate[lang].cartContext.loadCart.error
          );
        } else {
          toast.error(cartContextTranslate[lang].errors.global);
        }
      }
    };
    loadCart();
  }, [user]);
  useEffect(() => {
    if (!user) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, user]);
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const getLocalCart = storedCart ? JSON.parse(storedCart) : [];
    const mergeLocalCart = async () => {
      if (user) {
        try {
          await mergeLocalCartWithDB();
          toast.success(
            cartContextTranslate[lang].cartContext.mergeLocalCart.success
          );
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(
              error?.message ||
                cartContextTranslate[lang].cartContext.mergeLocalCart.error
            );
          } else {
            toast.error(cartContextTranslate[lang].errors.global);
          }
        }
      }
    };
    if (getLocalCart.length > 0) {
      mergeLocalCart();
    }
  }, [user]);

  return (
    <CartContext.Provider
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
    </CartContext.Provider>
  );
};
export const useCartItems = () => useContext(CartContext);
