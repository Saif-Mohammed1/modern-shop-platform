// pages/wishlist.js
"use client";
import {
  useWishlist,
  WishlistType,
} from "@/components/providers/context/wishlist/wishlist.context";
import WishListCard from "./wishListCard";
import { useEffect, useState } from "react";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import { lang } from "@/app/lib/utilities/lang";

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const [wishlistProduct, setWishlistProduct] = useState<WishlistType[]>([]);

  useEffect(() => {
    setWishlistProduct(wishlist);
  }, [wishlist]);
  return (
    <div className="container mx-auto mt-8 max-h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 ">
        {accountWishlistTranslate[lang].wishlistPage.title}
      </h1>
      {wishlistProduct.length === 0 ? (
        <p className="empty">
          {accountWishlistTranslate[lang].wishlistPage.emptyWhishlist}
        </p>
      ) : (
        <div className="grid col gap-4">
          {wishlistProduct.map((product) => {
            const products = product.productId;
            return <WishListCard key={product?._id} product={products} />;
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
