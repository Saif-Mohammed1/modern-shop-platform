// UserSessionSync.tsx
"use client";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import tokenManager from "@/app/lib/utilities/TokenManager";

import { loadCart, useCartStore } from "./store/cart/cart.store";
import { logOutUser, updateUser, useUserStore } from "./store/user/user.store";
import {
  loadWishlist,
  useWishlistStore,
} from "./store/wishlist/wishlist.store";
export const UserSessionSync = ({
  initialSession,
}: {
  initialSession: Session | null;
}) => {
  const { data: session } = useSession();
  useEffect(() => {
    // console.log("From Session", session);
    // console.log("From initialSession", initialSession);
    // Use CLIENT session when available, fallback to server session
    const effectiveSession = session || initialSession;
    // console.log("From Providers", effectiveSession);
    if (effectiveSession && effectiveSession.user) {
      const user = {
        ...effectiveSession.user,
        name: effectiveSession.user.name || "",
        email: effectiveSession.user.email || "",
      };
      updateUser(user);
      if (effectiveSession?.user?.accessToken) {
        tokenManager.setAccessToken(effectiveSession?.user?.accessToken);
      }
    }
    // else {
    //   console.log("UserSessionSync: No user found in session");
    //   console.log("UserSessionSync: ", effectiveSession);
    //   console.trace("updateUser(null) called");

    //   updateUser(null);
    // }
    if (effectiveSession?.error === "RefreshAccessTokenError") {
      void (async () => {
        await logOutUser();
      })();
    }
  }, [session, initialSession]);
  // useEffect(() => {
  //   if (initialSession?.user) {
  //     void Promise.all([loadCart(), loadWishlist()]);
  //   }
  // }, [initialSession?.user]);

  // ✅ Zustand user subscription to load/clear cart + wishlist
  useEffect(() => {
    const unsubscribe = useUserStore.subscribe(
      (state) => state.user,
      (user) => {
        // console.log("From Session", initialSession);

        // console.log("From Zustand user store", user);
        // console.log("From Zustand user store", initialSession?.user);
        if (user) {
          void Promise.all([loadCart(), loadWishlist()]);
        } else {
          // clear on logout
          useCartStore.setState({ cartItems: [] });
          useWishlistStore.setState({ wishlist: { items: [], userId: "" } });
          useCartStore.persist.clearStorage();
        }
      }
    );

    return unsubscribe;
  }, []);
  return null;
};
