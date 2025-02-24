"use client";
import { createContext, useState, useContext, useEffect } from "react";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import { ProductType } from "@/app/lib/types/products.types";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { useUser } from "../user/user.context";
export type WishlistType = {
  productId: ProductType;
  userId: string;
  _id?: string;
};
type wishlistContextType = {
  wishlist: WishlistType[];
  toggleWishlist: (product: ProductType) => Promise<void>;
  isInWishlist: (id: string) => boolean;
};
const WishlistContext = createContext<wishlistContextType>({
  wishlist: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
});

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlist, setWishlist] = useState<WishlistType[]>([]);
  const { user } = useUser();
  const getMyWishList = async () => {
    try {
      const response = await api.get("/customers/wishlist");
      setWishlist(response.data.docs);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountWishlistTranslate[lang].wishListContext.loadWishlist.error
        );
      }
    }
  };
  // Load wishlist from localStorage or database
  useEffect(() => {
    const loadWishlist = async () => {
      if (user) {
        try {
          const data = await getMyWishList();
          setWishlist(data ?? []);
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

  const toggleWishlist = async (product: ProductType) => {
    if (user) {
      try {
        const exists = wishlist.some(
          (item) => item.productId._id === product._id
        );
        if (exists) {
          setWishlist((prevWishlist) =>
            prevWishlist.filter((item) => item.productId._id !== product._id)
          );
          toast.success(
            accountWishlistTranslate[lang].WishListCard.functions
              .handleWishlistClick.removed
          );
        }
        setWishlist((prevWishlist) => [
          ...prevWishlist,
          {
            productId: product,
            userId: user._id.toString(),
          },
        ]);
        toast.success(
          accountWishlistTranslate[lang].WishListCard.functions
            .handleWishlistClick.success
        );
        await api.post("/customers/wishlist/" + product._id);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error(accountWishlistTranslate[lang].errors.global);
        }
        const data = await getMyWishList();
        setWishlist(data ?? []);
        throw error;
      }
    }
  };

  const isInWishlist = (id: string) => {
    return wishlist.some((item) => item.productId._id === id);
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
