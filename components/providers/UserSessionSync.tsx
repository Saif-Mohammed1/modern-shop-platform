// UserSessionSync.tsx
"use client";
import { gql, useQuery } from "@apollo/client";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import type { CartItemsType } from "@/app/lib/types/cart.db.types";
import type { WishlistType } from "@/app/lib/types/wishList.types";
import { lang } from "@/app/lib/utilities/lang";
import tokenManager from "@/app/lib/utilities/TokenManager";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { useCartStore } from "./store/cart/cart.store";
import { logOutUser, updateUser, useUserStore } from "./store/user/user.store";
import { useWishlistStore } from "./store/wishlist/wishlist.store";

// import { loadWishlist } from "./store/wishlist/wishlist.store";
// GraphQL
const GET_WISHLIST = gql`
  query {
    getMyWishlists {
      items {
        _id
        name
        price
        category
        discount
        images {
          _id
          link
        }
      }
      _id
    }
  }
`;
export const GET_CART = gql`
  query {
    getMyCart {
      products {
        _id
        name
        price
        category
        discount

        images {
          _id
          link
        }
        quantity
      }
    }
  }
`;
export const UserSessionSync = ({
  initialSession, // Initial session from server-side props
}: {
  initialSession: Session | null;
}) => {
  const { data: session } = useSession();
  const _query = useQuery<{ getMyWishlists: WishlistType }>(GET_WISHLIST, {
    skip: !session?.user,
    onCompleted: (data) => {
      useWishlistStore.setState({ wishlist: data.getMyWishlists });
    },
    onError: (err) => {
      toast.error(
        err.message ||
          accountWishlistTranslate[lang].wishListContext.loadWishlist.error
      );
      useWishlistStore.setState({ wishlist: { items: [], _id: "" } });
    },
  });
  const _queryCart = useQuery<{ getMyCart: { products: CartItemsType[] } }>(
    GET_CART,
    {
      skip: !session?.user,
      onCompleted: (data) => {
        useCartStore.setState({
          cartItems: data.getMyCart.products,
        });
      },
      onError: (err) => {
        toast.error(err?.message || cartContextTranslate[lang].errors.global);
      },
    }
  );
  useEffect(() => {
    // Use CLIENT session when available, fallback to server session
    const effectiveSession = session || initialSession;
    //console.log("From Session", effectiveSession);
    if (
      effectiveSession?.error === "RefreshAccessTokenError" ||
      tokenManager.getLogOut()
    ) {
      void (async () => {
        await logOutUser();
      })();
      return;
    }
    // console.log("From Providers", effectiveSession);
    if (effectiveSession && effectiveSession.user) {
      const user = {
        ...effectiveSession.user,
        name: effectiveSession.user.name || "",
        email: effectiveSession.user.email || "",
      };
      updateUser(user);
      if (effectiveSession?.user?.access_token) {
        tokenManager.setAccessToken(effectiveSession?.user?.access_token);
      }
    }
  }, [initialSession, session]);

  // ✅ Zustand user subscription to load/clear cart + wishlist
  useEffect(() => {
    const unsubscribe = useUserStore.subscribe(
      (state) => state.user,
      (user) => {
        if (!user) {
          //   void (async () => {
          //     await Promise.all([loadCart(), loadWishlist()]);
          //   })();
          // } else {
          // clear on logout
          void (async () => {
            await logOutUser();
          })();
        }
      }
    );

    return unsubscribe;
  }, []);

  return null;
};
