"use client";
import { createContext, useState, useContext, useEffect } from "react";
import api from "../util/axios.api";
import { useUser } from "./user.context";
import toast from "react-hot-toast";

const WishlistContext = createContext({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => {},
});

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useUser();

  // Load wishlist from localStorage or database
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const { data } = await api.get("/customer/wishlist");
          setWishlist(data.data);
        } catch (error) {
          toast.error(error?.message || "Failed to load wishlist");
        }
      } else {
        const storedWishlist =
          JSON.parse(localStorage.getItem("wishlist")) || [];
        setWishlist(storedWishlist);
      }
    };
    loadWishlist();
  }, [user]);

  // Save wishlist to localStorage if user does not exist
  useEffect(() => {
    if (!user) {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = async (product) => {
    if (user) {
      try {
        await api.post("/customer/wishlist/" + product._id);
        setWishlist((prevWishlist) => [...prevWishlist, { product }]);
      } catch (error) {
        throw error;
      }
    } else {
      setWishlist((prevWishlist) => [...prevWishlist, { product }]);
    }
  };

  const removeFromWishlist = async (product) => {
    if (user) {
      try {
        await api.delete(`/customer/wishlist/${product._id}`);
        setWishlist((prevWishlist) =>
          prevWishlist.filter((item) => item.product._id !== product._id)
        );
      } catch (error) {
        throw error;
      }
    } else {
      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.product._id !== product._id)
      );
    }
  };

  const isInWishlist = (id) => {
    return wishlist.some((item) => item.product._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  return useContext(WishlistContext);
};
