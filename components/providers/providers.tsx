"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/cart.context";
import { UserProvider } from "../context/user.context";
import { WishlistProvider } from "../context/whishList.context";
import { NuqsAdapter } from "nuqs/adapters/next/app";
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <NuqsAdapter>
        <UserProvider>
          <CartProvider>
            <WishlistProvider> {children}</WishlistProvider>
          </CartProvider>
        </UserProvider>
      </NuqsAdapter>
    </SessionProvider>
  );
};

export default Providers;
