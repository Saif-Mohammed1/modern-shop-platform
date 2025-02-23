"use client";
import { createContext, useState, useContext, useEffect } from "react";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import { ProductType } from "@/app/lib/types/products.types";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { useUser } from "../user/user.context";
export type WishlistType = {
  product: ProductType;
  user: string;
  _id?: string;
};
type wishlistContextType = {
  wishlist: WishlistType[];
  addToWishlist: (product: ProductType) => void;
  removeFromWishlist: (product: ProductType) => void;
  isInWishlist: (id: string) => boolean;
};
const WishlistContext = createContext<wishlistContextType>({
  wishlist: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
});

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<WishlistType[]>([]);
  const { user } = useUser();

  // Load wishlist from localStorage or database
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const { data } = await api.get("/customers/wishlist");
          setWishlist(data.data ?? []);
        } catch (error: unknown) {
          if (error instanceof Error) {
            toast.error(
              error.message ||
                accountWishlistTranslate[lang].wishListContext.loadWishlist
                  .error
            );
          } else {
            toast.error(accountWishlistTranslate[lang].errors.global);
          }
          setWishlist([]);
        }
      } else {
        const storedWishlist = localStorage.getItem("wishlist");
        if (!storedWishlist) {
          return setWishlist([]);
        } else {
          setWishlist(JSON.parse(storedWishlist) ?? []);
        }
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

  const addToWishlist = async (product: ProductType) => {
    if (user) {
      try {
        await api.post("/customers/wishlist/" + product._id);
        setWishlist((prevWishlist) => [
          ...prevWishlist,
          {
            product,
            user:
              // typeof product.user === "string"
              //   ? product.user
              product.user._id as string,
          },
        ]);
      } catch (error) {
        throw error;
      }
    } else {
      setWishlist((prevWishlist) => [
        ...prevWishlist,
        {
          product,
          user:
            // typeof product.user === "string" ? product.user :
            product.user._id as string,
        },
      ]);
    }
  };

  const removeFromWishlist = async (product: ProductType) => {
    if (user) {
      try {
        await api.delete(`/customers/wishlist/${product._id}`);
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

  const isInWishlist = (id: string) => {
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

export const useWishlist = () => useContext(WishlistContext);
