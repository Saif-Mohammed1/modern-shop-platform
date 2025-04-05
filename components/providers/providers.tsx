'use client';

import {SessionProvider} from 'next-auth/react';
import {NuqsAdapter} from 'nuqs/adapters/next/app';

import {CartProvider} from './context/cart/cart.context';
import {UserProvider} from './context/user/user.context';
import {WishlistProvider} from './context/wishlist/wishlist.context';

const Providers = ({children}: {children: React.ReactNode}) => {
  return (
    <SessionProvider
      refetchInterval={Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60 - 80}
      basePath="/api/v1/auth"
      refetchOnWindowFocus={true}
    >
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
