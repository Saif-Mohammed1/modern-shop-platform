import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCartItems, CartItemsType } from "../context/cart.context";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "../context/user.context";
import imageSrc from "../util/productImageHandler";
import { cartDropdownTranslate } from "@/app/_translate/cartDropdownTranslate";
import { lang } from "../util/lang";
type CartDropdownProps = {
  toggleIsCartOpen: () => void;
  setIsCartOpen: (value: boolean) => void;
  cartItems: CartItemsType[];
};
const CartDropdown = ({
  toggleIsCartOpen,
  setIsCartOpen,
  cartItems,
}: CartDropdownProps) => {
  const { removeCartItem, addToCartItems, clearProductFromCartItem } =
    useCartItems();

  const { user } = useUser();
  const router = useRouter();
  const cartRef = useRef<HTMLDivElement | null>(null);
  const handleIncrease = async (item: CartItemsType) => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        cartDropdownTranslate[lang].functions.handleIncrease.addingToCart
      );
      await addToCartItems(item);

      toast.success(
        cartDropdownTranslate[lang].functions.handleIncrease.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            cartDropdownTranslate[lang].functions.handleIncrease.error
        );
      } else {
        toast.error(cartDropdownTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handleDecrease = async (item: CartItemsType) => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        cartDropdownTranslate[lang].functions.handleDecrease.removingFromCart
      );
      await removeCartItem(item);
      toast.success(
        cartDropdownTranslate[lang].functions.handleDecrease.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            cartDropdownTranslate[lang].functions.handleDecrease.error
        );
      } else {
        toast.error(cartDropdownTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
    // if (quantities[itemId] > 1) {
    //   const newQuantities = { ...quantities, [itemId]: quantities[itemId] - 1 };
    //   setQuantities(newQuantities);
    //   updateCartQuantity(itemId, newQuantities[itemId]); // Call to update quantity in the cart state
    // }
  };
  const handelClearItem = async (item: CartItemsType) => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        cartDropdownTranslate[lang].functions.handelClearItem.clearingProduct
      );
      await clearProductFromCartItem(item);
      toast.success(
        cartDropdownTranslate[lang].functions.handelClearItem.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            cartDropdownTranslate[lang].functions.handelClearItem.error
        );
      } else {
        toast.error(cartDropdownTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handelOnCheckout = () => {
    if (cartItems && cartItems.length === 0) {
      toast.error(
        cartDropdownTranslate[lang].functions.handelOnCheckout.noProduct
      );
      return;
    }
    if (!user) {
      toast.error(
        cartDropdownTranslate[lang].functions.handelOnCheckout.noUser
      );
      return;
    }

    router.push("/checkout");
  };
  useEffect(() => {
    const shoppingCart = document.querySelector(".shopping-cart");
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cartRef.current &&
        !cartRef.current.contains(event.target as Node) &&
        shoppingCart &&
        !shoppingCart.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsCartOpen]);
  return (
    <div
      ref={cartRef}
      className="absolute right-3 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 top-[10vh]"
      onMouseLeave={toggleIsCartOpen}
    >
      <div className="p-4 min-h-[40vh] max-h-[60vh] overflow-y-auto">
        {/* Cart Items */}
        {cartItems && cartItems.length > 0 ? (
          cartItems.map((item, index) => {
            const price =
              item.discount &&
              item.discountExpire &&
              item.discountExpire > new Date()
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
            {cartDropdownTranslate[lang].content.emptyCart}
          </p>
        )}
      </div>

      {/* Checkout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition duration-200"
          onClick={handelOnCheckout}
        >
          {cartDropdownTranslate[lang].content.proceedToCheckout}
        </button>
      </div>
    </div>
  );
};

export default CartDropdown;
