"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { FiX } from "react-icons/fi";

import { type CartItemsType } from "@/app/lib/types/cart.types";
import { lang } from "@/app/lib/utilities/lang";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import { cartDropdownTranslate } from "@/public/locales/client/(public)/cartDropdownTranslate";

import {
  addToCartItems,
  clearProductFromCartItem,
  decrementCartItemQuantity,
} from "../providers/store/cart/cart.store";
import { useUserStore } from "../providers/store/user/user.store";

type CartDropdownProps = {
  setIsCartOpen: (value: boolean) => void;
  cartItems: CartItemsType[];
};

const CartDropdown = ({ setIsCartOpen, cartItems }: CartDropdownProps) => {
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const cartRef = useRef<HTMLDivElement>(null);

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
      if (toastId) {
        toast.dismiss(toastId);
      }
    }
  };

  const handleIncrease = (item: CartItemsType) =>
    handleCartAction(
      () => addToCartItems(item),
      cartDropdownTranslate[lang].functions.handleIncrease.addingToCart,
      cartDropdownTranslate[lang].functions.handleIncrease.success,
      cartDropdownTranslate[lang].functions.handleIncrease.error
    );

  const handleDecrease = (item: CartItemsType) =>
    handleCartAction(
      () => decrementCartItemQuantity(item),
      cartDropdownTranslate[lang].functions.handleDecrease.removingFromCart,
      cartDropdownTranslate[lang].functions.handleDecrease.success,
      cartDropdownTranslate[lang].functions.handleDecrease.error
    );

  const handelClearItem = (item: CartItemsType) =>
    handleCartAction(
      () => clearProductFromCartItem(item),
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
  // const quantityUpdate = (
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   item: CartItemsType
  // ) => {
  //   const value = e.target.value;
  //   if (value === "") return;

  //   const quantity = Math.max(1, Number(value));

  //   if (quantity > item.stock) {
  //     toast.error(
  //       cartDropdownTranslate[lang].functions.quantityUpdate.notEnoughStock
  //     );
  //     return;
  //   }

  //   addToCartItems(item, quantity);
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const cartButton = document.querySelector(".shopping-cart");
      const target = event.target as Node;

      if (
        cartRef.current &&
        !cartRef.current.contains(target) &&
        cartButton &&
        !cartButton.contains(target)
      ) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsCartOpen]);

  // const calculatePrice = (item: CartItemsType) => {
  //   const now = new Date();
  //   const discountExpire = item.discountExpire
  //     ? new Date(item.discountExpire)
  //     : null;
  // const discountPercentage =
  //   item.discount > 0
  //     ? Math.round((item.discount / item.price) * 100)
  //     : 0;
  //   const isValidDiscount =
  //     !!item.discount && !!discountExpire && discountExpire > now;
  //   return isValidDiscount ? item.price - item.discount : item.price;
  // };
  return (
    <>
      <button
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={() => setIsCartOpen(false)}
      />

      <div
        ref={cartRef}
        className="fixed md:absolute right-0 top-0 md:top-[10vh] h-full md:h-auto 
        w-full max-w-xs md:w-80 bg-white shadow-xl md:rounded-lg z-50
        transform transition-transform duration-300 ease-in-out
        md:right-3 md:mt-2 translate-x-0"
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b md:hidden">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <button
            onClick={() => {
              setIsCartOpen(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="p-4 h-[calc(100vh-140px)] md:min-h-[40vh] md:max-h-[60vh] overflow-y-auto">
          {/* Keep existing cart items rendering */}
          {cartItems?.length > 0 ? (
            cartItems.map((item) => {
              const { discountedPrice: price } = calculateDiscount(item);
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
                        className="text-sm #w-12 text-center bg-transparent"
                        value={item.quantity}
                        min={1}
                        max={item.stock}
                        readOnly
                        // onChange={(e) => {
                        //   const value = e.target.value;
                        //   if (/^[0-9]*$/.test(value)) {
                        //     // Additional validation
                        //     quantityUpdate(e, item);
                        //   }
                        // }}
                        // onKeyDown={(e) => {
                        //   // Prevent arrow key changes if desired
                        //   if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        //     e.preventDefault();
                        //   }
                        // }}
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

        <div className="p-4 border-t border-gray-200 absolute bottom-0 w-full bg-white md:relative">
          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md transition-colors duration-200"
            onClick={handelOnCheckout}
          >
            {cartDropdownTranslate[lang].content.proceedToCheckout}
          </button>
        </div>
      </div>
    </>
  );
};

export default CartDropdown;
