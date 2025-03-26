// components/ProductCard.js
import type { ProductType } from "@/app/lib/types/products.types";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { useCartItems } from "@/components/providers/context/cart/cart.context";
import { lang } from "@/app/lib/utilities/lang";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import Image from "next/image";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineShoppingCart } from "react-icons/ai"; // Import cart icon
import api from "@/app/lib/utilities/api";
import { useRouter } from "next/navigation";

const WishListCard = ({ product }: { product: ProductType }) => {
  // const { toggleWishlist, isInWishlist } = useWishlist();
  const router = useRouter();
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
    let toastLoading;
    try {
      toastLoading = toast.loading(
        accountWishlistTranslate[lang].WishListCard.functions
          .handleWishlistClick.loading
      );
      await api.post("/customers/wishlist/" + product._id);
      toast.success(
        accountWishlistTranslate[lang].WishListCard.functions
          .handleWishlistClick.removed
      );
      router.refresh();
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
    } finally {
      toast.dismiss(toastLoading);
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
          <AiFillHeart className="text-red-500 mr-2 text-3xl" />

          {/* {isInWishlist(product._id) ? (
            <AiFillHeart className="text-red-500 mr-2 text-3xl" />
          ) : (
            <AiOutlineHeart className="mr-2  text-3xl" />
          )} */}
        </button>
      </div>
    </div>
  );
};

export default WishListCard;
