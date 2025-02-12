// components/ProductCard.js
import { ProductType } from "@/app/lib/types/products.types";
import { accountWishlistTranslate } from "@/app/_translate/(auth)/account/wishlistTranslate";
import { shopPageTranslate } from "@/app/_translate/(public)/shop/shoppageTranslate";
import { useCartItems } from "@/components/providers/context/cart.context";
import { useWishlist } from "@/components/providers/context/whishList.context";
import { lang } from "@/app/lib/util/lang";
import imageSrc from "@/app/lib/util/productImageHandler";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineShoppingCart,
} from "react-icons/ai"; // Import cart icon

const WishListCard = ({ product }: { product: ProductType }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCartItems } = useCartItems();
  const handelAddToCart = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        shopPageTranslate[lang].productCard.handleAddToCart.loading
      );
      await addToCartItems(product);
      toast.success(
        shopPageTranslate[lang].productCard.handleAddToCart.success
      );
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].productCard.handleAddToCart.failed
      );
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  const handleWishlistClick = async () => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product);
        toast.success(
          accountWishlistTranslate[lang].WishListCard.functions
            .handleWishlistClick.removed
        );
      } else {
        await addToWishlist(product);
        toast.success(
          accountWishlistTranslate[lang].WishListCard.functions
            .handleWishlistClick.success
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountWishlistTranslate[lang].WishListCard.functions
              .handleWishlistClick.error
        );
      } else {
        toast.error(accountWishlistTranslate[lang].errors.global);
      }
    }
  };

  return (
    <div className="border rounded-lg shadow-lg p-4">
      <div className="imgParent">
        <Image
          src={imageSrc(product)}
          alt={product.name}
          // className="w-full h-full #h-auto object-cover rounded-lg"
          width={200}
          height={200}
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <h3 className="text-xl font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <div className="flex justify-between mt-2">
        {" "}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={handelAddToCart}
        >
          <AiOutlineShoppingCart className="text-xl" /> {/* Cart Icon */}
        </button>
        <button
          onClick={handleWishlistClick}
          // className="mt-2 flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
        >
          {isInWishlist(product._id) ? (
            <AiFillHeart className="text-red-500 mr-2 text-3xl" />
          ) : (
            <AiOutlineHeart className="mr-2  text-3xl" />
          )}
          {/* {isInWishlist(product._id)
            ? accountWishlistTranslate[lang].WishListCard.functions.isInWishlist
                .remove
            : accountWishlistTranslate[lang].WishListCard.functions.isInWishlist
                .add} */}
        </button>
      </div>
    </div>
  );
};

export default WishListCard;
