// pages/wishlist.js
"use client";

import { lang } from "@/app/lib/utilities/lang";
import { useWishlistStore } from "@/components/providers/store/wishlist/wishlist.store";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";

import WishListCard from "./wishListCard";

const WishlistPage = () => {
  const wishlist = useWishlistStore((state) => state.wishlist);

  return (
    <div className="container mx-auto mt-8 ">
      <h1 className="text-3xl font-bold mb-4 ">
        {accountWishlistTranslate[lang].wishlistPage.title}
      </h1>
      <div className="max-h-screen overflow-y-auto">
        {wishlist.items.length === 0 ? (
          <p className="empty">
            {accountWishlistTranslate[lang].wishlistPage.emptyWhishlist}
          </p>
        ) : (
          <div className="grid col gap-4">
            {wishlist.items.map((product) => {
              const products = product.productId;
              return <WishListCard key={products?._id} product={products} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
