"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useUser } from "./user.context.jsx";
import {
  addToCart,
  getCartItems,
  removeFromCart,
  clearItemFromCart,
  mergeLocalCartWithDB,
} from "./cartAction.js";
import toast from "react-hot-toast";
import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate.js";
import { UserType } from "@/@types/next-auth.js";
import { cartContextTranslate } from "@/app/_translate/cartContextTranslate.js";
import { lang } from "@/components/util/lang";
export type UserInCart = Partial<UserType> | undefined;
// export type CartItemsType = {
//   _id: string;
//   quantity: number;
//   product: ProductType;
//   user?: UserInCart;
// };
export type CartItemsType = {
  quantity: number;
} & ProductType;

type CartContextType = {
  isCartOpen: boolean;
  toggleCartStatus: () => void;
  cartItems: CartItemsType[];
  addToCartItems: (product: ProductType) => void;
  removeCartItem: (product: ProductType) => void;
  setIsCartOpen: (status: boolean) => void;
  clearProductFromCartItem: (product: ProductType) => void;
};
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
const storedCart = localStorage.getItem("cart");
const parseStoredCart = storedCart ? JSON.parse(storedCart) : [];
// Create a CartProvider component
export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  // Define the state for the cart
  const [cartItems, setCartItems] = useState<CartItemsType[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [LocalCart] = useState(parseStoredCart);
  const { user } = useUser();
  // Function to update the cart
  const addToCartItems = async (product: ProductType) => {
    try {
      await addToCart(product, user);

      setCartItems((pre) => {
        const existingProduct = pre.find((item) => item._id === product._id);

        if (existingProduct) {
          // If the product already exists, update its quantity
          return pre.map((item) =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          // If the product doesn't exist, add it to the cart
          return [...pre, { ...product, quantity: 1 }];
        }
      });
      // toast.success("Product added to cart");
    } catch (error) {
      throw error;
      // toast.error(error?.message || "Failed to add to cart");
    }
  };

  const removeCartItem = async (product: ProductType) => {
    try {
      const data = await removeFromCart(product, user);
      setCartItems(data);
    } catch (error) {
      throw error;
    }
  };
  const clearProductFromCartItem = async (product: ProductType) => {
    try {
      await clearItemFromCart(product, user);
      setCartItems((pre) => pre.filter((item) => item._id !== product._id));
    } catch (error) {
      throw error;
    }
  };
  const toggleCartStatus = () => {
    setIsCartOpen(!isCartOpen);
  };

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
    const mergeLocalCart = async () => {
      if (user && LocalCart.length > 0) {
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
    mergeLocalCart();
  }, [user, LocalCart.length]);

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
export const useCartItems = () => {
  return useContext(CartContext);
};
