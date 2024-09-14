import Image from "next/image";
import { useState } from "react";
import { useCartItems } from "../context/cart.context";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "../context/user.context";
import imageSrc from "../util/productImageHandler";

const CartDropdownV2 = ({ toggleIsCartOpen, cartItems }) => {
  const { removeCartItem, addToCartItems, clearProductFromCartItem } =
    useCartItems();

  const { user } = useUser();
  const router = useRouter();
  const handleIncrease = async (item) => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Adding to cart...");
      await addToCartItems(item);

      toast.success("Product Increase successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to add from cart");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handleDecrease = async (item) => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Removing from cart...");
      await removeCartItem(item);
      toast.success("Removed from cart");
    } catch (error) {
      toast.error(error?.message || "Failed to remove from cart");
    } finally {
      toast.dismiss(toastLoading);
    }
    // if (quantities[itemId] > 1) {
    //   const newQuantities = { ...quantities, [itemId]: quantities[itemId] - 1 };
    //   setQuantities(newQuantities);
    //   updateCartQuantity(itemId, newQuantities[itemId]); // Call to update quantity in the cart state
    // }
  };
  const handelClearItem = async (item) => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Clearing Product from cart...");
      await clearProductFromCartItem(item);
      toast.success("product cleared successfully");
    } catch (error) {
      toast.error(error?.message || "Failed to clear product from cart");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handelOnCheckout = () => {
    if (cartItems && cartItems.length === 0) {
      toast.error(
        "You need at least one product in the cart to proceed to checkout"
      );
      return;
    }
    if (!user) {
      toast.error("You need to be login to proceed to checkout");
      return;
    }

    router.push("/checkout");
  };
  return (
    <div
      className="absolute right-3 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 top-[10vh]"
      onMouseLeave={toggleIsCartOpen}
    >
      <div className="p-4 min-h-[40vh] max-h-[60vh] overflow-y-auto">
        {/* Cart Items */}
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item, index) => {
            const price =
              item.discount && item.discountExpire > new Date().toISOString()
                ? item.price - item.discount
                : item.price;

            return (
              <div key={index} className="flex items-center gap-4 mb-4">
                <Image
                  src={imageSrc(item)}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-md"
                  priority
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700">
                    {item.name}
                  </h3>
                  <p className=" flex justify-between items-center my-1">
                    <span className="text-sm text-gray-500">${price}</span>

                    <span className="text-sm font-semibold text-gray-800">
                      ${price * item.quantity}
                    </span>
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 text-gray-600 rounded"
                      onClick={() => handleDecrease(item)}
                    >
                      -
                    </button>
                    <span className="text-sm">{item.quantity}</span>
                    <button
                      className="px-2 py-1 bg-gray-200 text-gray-600 rounded"
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>
                    <button
                      className="px-2 py-1 text-red-600 rounded text-lg ml-auto"
                      onClick={() => handelClearItem(item)}
                    >
                      x
                    </button>
                  </div>
                </div>
                {/* <div className="text-sm font-semibold text-gray-800">
                ${item.price * item.quantity}
              </div> */}
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center h-[50vh] flex justify-center items-center">
            Your cart is empty.
          </p>
        )}
      </div>

      {/* Checkout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
          onClick={handelOnCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartDropdownV2;
