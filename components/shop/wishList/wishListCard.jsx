// components/ProductCard.js
import { useWishlist } from "@/components/context/whishList.context";
import imageSrc from "@/components/util/productImageHandler";
import Image from "next/image";
import toast from "react-hot-toast";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

const WishListCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const handleWishlistClick = async () => {
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to add to wishlist");
    }
  };

  return (
    <div className="border rounded-lg shadow-lg p-4">
      <Image
        src={imageSrc(product)}
        alt={product.name}
        className="w-full h-auto object-cover rounded-lg"
        width={200}
        height={200}
        style={{ objectFit: "cover" }}
        priority
      />
      <h3 className="text-xl font-semibold mt-2">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={handleWishlistClick}
        className="mt-2 flex items-center justify-center w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg"
      >
        {isInWishlist(product._id) ? (
          <AiFillHeart className="text-red-500 mr-2" />
        ) : (
          <AiOutlineHeart className="mr-2" />
        )}
        {isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
      </button>
    </div>
  );
};

export default WishListCard;
