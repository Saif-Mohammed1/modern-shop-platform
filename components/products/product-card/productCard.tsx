import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import { useCartItems } from "@/components/context/cart.context";
import { useWishlist } from "@/components/context/whishList.context";
import { lang } from "@/components/util/lang";
import imageSrc from "@/components/util/productImageHandler";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { FaShareAlt } from "react-icons/fa";
import StarRatings from "react-star-ratings";
const ProductCard = ({ product }: { product: ProductType }) => {
  const { addToCartItems } = useCartItems();
  const { isInWishlist, removeFromWishlist, addToWishlist } = useWishlist();
  const [isInWishlistState, setIsInWishlistState] = useState(
    isInWishlist(product._id)
  );
  const toggleWishlist = async () => {
    let toastLoading;
    try {
      if (isInWishlistState) {
        toastLoading = toast.loading(
          shopPageTranslate[lang].productCard.toggleWishlist.loadingRemoving
        );
        await removeFromWishlist(product);
        toast.success(
          shopPageTranslate[lang].productCard.toggleWishlist.removed
        );
        setIsInWishlistState(false);
      } else {
        toastLoading = toast.loading(
          shopPageTranslate[lang].productCard.toggleWishlist.loadingAdding
        );
        await addToWishlist(product);
        setIsInWishlistState(true);
        toast.success(
          shopPageTranslate[lang].productCard.toggleWishlist.success
        );
      }
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : shopPageTranslate[lang].productCard.toggleWishlist.failed
      );
    } finally {
      toast.dismiss(toastLoading);
    }
  };
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
  const copyProductLink = async () => {
    // add this to clipbord
    const ToastId = toast.loading(
      shopPageTranslate[lang].productCard.copyProductLink.pending
    );
    const productLink = `${window.location.origin}/shop/${product.slug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(productLink);

      toast.success(
        shopPageTranslate[lang].productCard.copyProductLink.success
      );
      // await toast.promise(navigator.clipboard.writeText(productLink), {
      //   pending: "Promise is pending",
      //   success: "Product link copied to clipboard👌",
      //   error: "Error copying product link to clipboard",
      // });
    } else {
      toast.error(shopPageTranslate[lang].productCard.copyProductLink.error);
    }

    toast.dismiss(ToastId);
  };

  const discountPrice =
    product.discount > 0
      ? (product.price - product.discount).toFixed(2)
      : product.price;
  // product.discount > 0
  //   ? (product.price - product.price * (product.discount / 100)).toFixed(2)
  //   : product.price;

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow-md p-5 relative transition-transform transform hover:scale-105 cursor-pointer">
      {product.discount > 0 && (
        <div className="absolute top-4 -left-5 text-center transform -rotate-[35deg] p-1 leading-5 custom-shadow  bg-red-500 text-white text-xs font-bold rounded-br-lg w-[40%]">
          {((product.discount / product.price) * 100).toFixed(0)}%
          {shopPageTranslate[lang].RelatedProducts.off}
        </div>
      )}
      <Link href={"/shop/" + product.slug}>
        <div className="imgParent">
          <Image
            src={imageSrc(product)}
            alt={product.name}
            // className="w-full h-full #h-auto object-cover rounded-lg"
            // className=" h-auto object-cover mb-4 rounded-md  max-w-[100%]"
            width={1000}
            height={1000}
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      </Link>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {product.name}
      </h2>
      <p className="text-gray-500 mb-4">{product.description}</p>

      <div className="flex items-center justify-between mb-4">
        <div>
          {product.discount > 0 ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium line-through">
                ${product.price}
              </span>
              <span className="text-red-500 font-bold">${discountPrice}</span>
            </div>
          ) : (
            <span className="text-gray-700 font-medium">${product.price}</span>
          )}
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          onClick={handelAddToCart}
        >
          {shopPageTranslate[lang].content.addToCart}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <StarRatings
            rating={product.ratingsAverage}
            starRatedColor="#ffb829"
            numberOfStars={5}
            starDimension="20px"
            starSpacing="2px"
            name="rating"
          />
          <span className="text-gray-600 text-sm">
            ({product.ratingsQuantity})
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-red-500 text-2xl focus:outline-none"
            aria-label="Add to Wishlist"
            onClick={toggleWishlist}
          >
            {isInWishlistState ? <AiFillHeart /> : <AiOutlineHeart />}
          </button>
          <button
            className="text-gray-500 hover:text-gray-600 transition-colors"
            aria-label="Share Product"
            onClick={copyProductLink}
          >
            <FaShareAlt size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
