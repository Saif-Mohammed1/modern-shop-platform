import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaHeart, FaShareAlt } from "react-icons/fa";
import StarRatings from "react-star-ratings";
import imageSrc from "../util/productImageHandler";
/*width: 35%;
    top: 18px;
    left: -21px;
    transform: rotate(-35deg);
    padding: 3px;
    text-align: center;
    line-height: 20px;
    box-shadow: rgba(0, 0, 0, 0.5) -5px 5px 10px;
}*/
const Test = ({ product }) => {
  const copyProductLink = async () => {
    // add this to clipbord
    const productLink = `${window.location.origin}/shop/${product._id}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(productLink);

      await toast.promise(navigator.clipboard.writeText(productLink), {
        pending: "Promise is pending",
        success: "Product link copied to clipboard👌",
        error: "Error copying product link to clipboard",
      });
      // .then(() => {
      //   //console.log("Product link copied to clipboard:", productLink);
      //   // Optionally, you can show a success message to the user
      // })
      // .catch((error) => {
      //   //console.error("Error copying product link to clipboard:", error);
      //   // Optionally, you can show an error message to the user
      // });
    } else {
      //console.warn("Clipboard API not supported in this browser.");
      // Optionally, provide a fallback or inform the user that clipboard copying is not supported
    }
  };

  const discountPrice =
    product.discount > 0
      ? (product.price - product.price * (product.discount / 100)).toFixed(2)
      : product.price;

  return (
    <div className="bg-white overflow-hidden rounded-lg shadow-md p-5 relative transition-transform transform hover:scale-105 cursor-pointer">
      {product.discount > 0 && (
        <div className="absolute top-4 -left-5 text-center transform -rotate-[35deg] p-1 leading-5 custom-shadow  bg-red-500 text-white text-xs font-bold rounded-br-lg w-[40%]">
          {product.discount}% OFF
        </div>
      )}
      <Link href={"/shop/" + product._id}>
        <Image
          src={imageSrc(product)}
          alt={product.name}
          className=" h-auto object-cover mb-4 rounded-md  max-w-[100%]"
          width={1200}
          height={1200}
          style={{ objectFit: "cover" }}
          priority
        />
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
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors">
          Add to Cart
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <StarRatings
            rating={product.rating}
            starRatedColor="#ffb829"
            numberOfStars={5}
            starDimension="20px"
            starSpacing="2px"
            name="rating"
          />
          <span className="text-gray-600 text-sm">({product.ratingCount})</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="text-red-500 hover:text-red-600 transition-colors"
            aria-label="Add to Wishlist"
          >
            <FaHeart size={20} />
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

export default Test;
