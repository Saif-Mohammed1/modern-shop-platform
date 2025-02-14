import Image from "next/image";
import { useEffect, useRef } from "react";
import { useCartItems, CartItemsType } from "../providers/context/cart.context";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "../providers/context/user.context";
import imageSrc from "../../app/lib/utilities/productImageHandler";
import { cartDropdownTranslate } from "@/public/locales/client/(public)/cartDropdownTranslate";
import { lang } from "../../app/lib/utilities/lang";

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
  const cartRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleCartAction = async (
    action: () => Promise<void>,
    loadingMessage: string,
    successMessage: string,
    errorMessage: string
  ) => {
    let toastId: string | undefined;
    try {
      toastId = toast.loading(loadingMessage);
      await action();
      toast.success(successMessage);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : errorMessage;
      toast.error(message);
    } finally {
      if (toastId) toast.dismiss(toastId);
    }
  };

  const handleIncrease = (item: CartItemsType) =>
    handleCartAction(
      () => Promise.resolve(addToCartItems(item)),
      cartDropdownTranslate[lang].functions.handleIncrease.addingToCart,
      cartDropdownTranslate[lang].functions.handleIncrease.success,
      cartDropdownTranslate[lang].functions.handleIncrease.error
    );

  const handleDecrease = (item: CartItemsType) =>
    handleCartAction(
      () => Promise.resolve(removeCartItem(item)),
      cartDropdownTranslate[lang].functions.handleDecrease.removingFromCart,
      cartDropdownTranslate[lang].functions.handleDecrease.success,
      cartDropdownTranslate[lang].functions.handleDecrease.error
    );

  const handelClearItem = (item: CartItemsType) =>
    handleCartAction(
      () => Promise.resolve(clearProductFromCartItem(item)),
      cartDropdownTranslate[lang].functions.handelClearItem.clearingProduct,
      cartDropdownTranslate[lang].functions.handelClearItem.success,
      cartDropdownTranslate[lang].functions.handelClearItem.error
    );

  const handelOnCheckout = () => {
    if (!cartItems?.length) {
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
  const quantityUpdate = (
    e: React.ChangeEvent<HTMLInputElement>,
    item: CartItemsType
  ) => {
    const value = e.target.value;
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    debounceTimeout.current = setTimeout(() => {
      if (value === "") {
        return;
      }
      const quantity = Math.max(1, Number(value));
      if (quantity > item.stock) {
        toast.error(
          cartDropdownTranslate[lang].functions.quantityUpdate.notEnoughStock
        );
        return;
      }

      addToCartItems(item, quantity);
    }, 500);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsCartOpen]);
  // useEffect(() => {
  //   const shoppingCart = document.querySelector(".shopping-cart");
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       cartRef.current &&
  //       !cartRef.current.contains(event.target as Node) &&
  //       shoppingCart &&
  //       !shoppingCart.contains(event.target as Node)
  //     ) {
  //       setIsCartOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [setIsCartOpen]);
  const calculatePrice = (item: CartItemsType) => {
    const isValidDiscount =
      item.discount && item.discountExpire && item.discountExpire > new Date();

    return isValidDiscount ? item.price - item.discount : item.price;
  };

  return (
    <div
      ref={cartRef}
      className="absolute right-3 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 top-[10vh]"
      onMouseLeave={toggleIsCartOpen}
    >
      <div className="p-4 min-h-[40vh] max-h-[60vh] overflow-y-auto">
        {cartItems?.length > 0 ? (
          cartItems.map((item) => {
            const price = calculatePrice(item);
            const total = (price * item.quantity).toFixed(2);
            return (
              <div key={item._id} className="flex items-center gap-4 mb-4">
                <div className="relative w-16 h-16">
                  <Image
                    src={imageSrc(item)}
                    alt={item.name}
                    fill
                    className="rounded-md object-cover"
                    sizes="64px"
                  />
                </div>

                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </h3>
                  <div className="flex justify-between items-center my-1">
                    <span className="text-sm text-gray-500">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      ${total}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                      onClick={() => handleDecrease(item)}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="text-sm w-8 text-center bg-transparent"
                      value={item.quantity}
                      // readOnly
                      max={item.stock}
                      onKeyDown={(e) => {
                        // Prevent arrow key changes if desired
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => quantityUpdate(e, item)}
                    />
                    <button
                      className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300"
                      onClick={() => handleIncrease(item)}
                    >
                      +
                    </button>
                    <button
                      className="px-2 py-1 text-red-600 hover:text-red-700 text-lg ml-auto"
                      onClick={() => handelClearItem(item)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center h-[50vh] flex justify-center items-center">
            {cartDropdownTranslate[lang].content.emptyCart}
          </p>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200"
          onClick={handelOnCheckout}
        >
          {cartDropdownTranslate[lang].content.proceedToCheckout}
        </button>
      </div>
    </div>
  );
};

export default CartDropdown;
