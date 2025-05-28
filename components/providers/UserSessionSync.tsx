// UserSessionSync.tsx
"use client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import tokenManager from "@/app/lib/utilities/TokenManager";

import { loadCart, useCartStore } from "./store/cart/cart.store";
import { logOutUser, updateUser, useUserStore } from "./store/user/user.store";
import {
  loadWishlist,
  useWishlistStore,
} from "./store/wishlist/wishlist.store";
export const UserSessionSync = () => {
  const { data: session } = useSession();
  useEffect(() => {
    // Use CLIENT session when available, fallback to server session
    const effectiveSession = session;
    //console.log("From Session", effectiveSession);
    if (effectiveSession?.error === "RefreshAccessTokenError") {
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
  }, [session]);

  // ✅ Zustand user subscription to load/clear cart + wishlist
  useEffect(() => {
    const unsubscribe = useUserStore.subscribe(
      (state) => state.user,
      (user) => {
        // //console.log("From Session", initialSession);

        //console.log("From Zustand user store", user);
        // //console.log("From Zustand user store", initialSession?.user);
        if (user) {
          void Promise.all([loadCart(), loadWishlist()]);
        } else {
          // clear on logout
          useCartStore.setState({ cartItems: [] });
          useWishlistStore.setState({ wishlist: { items: [], _id: "" } });
          useCartStore.persist.clearStorage();
        }
      }
    );

    return unsubscribe;
  }, []);
  // useEffect(() => {
  //   const unsubscribe = useWishlistStore.subscribe((state, preState) => {
  //     // //console.log("From Session", initialSession);
  //     //console.log("From Zustand wishlist store", state.wishlist);
  //     //console.log("From Zustand wishlist store", preState.wishlist);
  //   });

  //   return unsubscribe;
  // }, []);
  // useEffect(() => {
  //   const unsubscribe = useCartStore.subscribe((state, preState) => {
  //     //console.log("From Zustand cart store", state.cartItems);
  //     //console.log("From Zustand cart store", preState.cartItems);
  //   });

  //   return unsubscribe;
  // }, []);
  return null;
};
