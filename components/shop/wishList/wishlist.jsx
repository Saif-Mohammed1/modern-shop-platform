// pages/wishlist.js
"use client";
import { useWishlist } from "@/components/context/whishList.context";
import WishListCard from "./wishListCard";
import { useEffect, useState } from "react";

const WishlistPage = () => {
  const { wishlist } = useWishlist();
  const [wishlistProduct, setWishlistProduct] = useState([]);

  useEffect(() => {
    setWishlistProduct(wishlist);
  }, [wishlist]);
  return (
    <div className="container mx-auto mt-8 max-h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-4 ">My Wishlist</h1>
      {wishlistProduct.length === 0 ? (
        <p className="empty">Your wishlist is empty.</p>
      ) : (
        <div className="grid col gap-4">
          {wishlistProduct.map((product) => {
            const products = product.product;
            return <WishListCard key={product._id} product={products} />;
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
