"use client";

import { SessionProvider } from "next-auth/react";
import { CartProvider } from "../context/cart.context";
import { UserProvider } from "../context/user.context";
import { WishlistProvider } from "../context/whishList.context";

const Providers = ({ children }) => {
  return (
    <SessionProvider>
      <UserProvider>
        <CartProvider>
          <WishlistProvider> {children}</WishlistProvider>
        </CartProvider>
      </UserProvider>
    </SessionProvider>
  );
};

export default Providers;
