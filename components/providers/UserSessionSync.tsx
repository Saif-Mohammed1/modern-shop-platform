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
  initialSession, // Initial session from server-side props
}: {
  initialSession: Session | null;
}) => {
  const { data: session } = useSession();
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
        // //console.log("From Session", initialSession);

        //console.log("From Zustand user store", user);
        // //console.log("From Zustand user store", initialSession?.user);
        if (user) {
          void (async () => {
            await Promise.all([loadCart(), loadWishlist()]);
          })();
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

  return null;
};
