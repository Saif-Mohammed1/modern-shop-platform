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

// Create the cart context
export const CartContext = createContext({
  isCartOpen: false,
  toggleCartStatus: () => {},
  cartItems: [],
  addToCartItems: async () => {},
  removeCartItem: async () => {},
  setIsCartOpen: () => {},
  clearProductFromCartItem: async () => {},
});

// Create a CartProvider component
export const CartProvider = ({ children }) => {
  // Define the state for the cart
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [LocalCart, setLocalCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const { user } = useUser();
  // Function to update the cart
  const addToCartItems = async (product) => {
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

  const removeCartItem = async (product) => {
    try {
      const data = await removeFromCart(product, user);
      setCartItems(data);
    } catch (error) {
      throw error;
    }
  };
  const clearProductFromCartItem = async (product) => {
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
          const data = await getCartItems(user._id);

          setCartItems(data);
        } else {
          const storedCart = await getCartItems();

          setCartItems(storedCart);
        }
      } catch (error) {
        toast.error(error?.message || "Failed to load cart");
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
          toast.success("Cart merged successfully");
        } catch (error) {
          toast.error(error?.message || "Failed to merge cart");
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
