"use client";

import { useContext, useState } from "react";
import { CartContext } from "../context/cartContext";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import fetchApi from "../util/axios.api";
import { useRouter } from "next/navigation";
import imageSrc from "../util/productImageHandler";

const Shipping = ({ address }) => {
  const [selectedShippingAddress, setSelectedShippingAddress] = useState(
    address[0] || []
  );
  const router = useRouter();
  const { cartItems } = useContext(CartContext);
  const handleAddressSelect = (selectedAddress) => {
    setSelectedShippingAddress(selectedAddress);
  };

  // Calculate subtotal of cart items
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.discount ? item.price - item.discount : item.price) * item.quantity,
    0
  );

  // Calculate tax (assuming 10%)
  const tax = subtotal * 0.1;

  // Calculate total amount (subtotal + tax)
  const totalAmount = subtotal + tax;
  const handleCheckout = async () => {
    if (selectedShippingAddress.length === 0) {
      toast.error("You need at least to select one address");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("You need at least to buy one item");
      return;
    }
    try {
      //console.log("selectedShippingAddress", selectedShippingAddress);
      const { data, error } = await fetchApi("/stripe/checkout", {
        method: "POST",
        body: JSON.stringify({
          products: cartItems,
          shippingInfo: selectedShippingAddress,
        }),
      });
      if (error) throw error;
      window.open(data.url, "_blank");
    } catch (error) {
      toast.error(
        error?.message ||
          error ||
          "an expected error happen please try again later"
      );
    }
  };
  return (
    <section className="p-4 ">
      <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col justify-between w-full  p-2">
          <div className="overflow-auto h-[50vh] no-scrollbar ">
            {" "}
            <div className="col grid  h-fit gap-[10px!important] ">
              {address &&
                address.map((addressItem) => (
                  <div
                    key={addressItem._id.toString()}
                    className={`bg-white/60 shadow-lg rounded-lg p-4 border cursor-pointer relative overflow-hidden ${
                      selectedShippingAddress?._id === addressItem._id
                        ? "border-blue-500"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleAddressSelect(addressItem)}
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      {addressItem.street}
                    </h3>
                    <p className="text-gray-600 mb-2">{`${addressItem.city}, ${addressItem.state}, ${addressItem.country}`}</p>
                    <p className="text-gray-600 mb-2">{`ZIP Code: ${addressItem.zipCode}`}</p>
                    <p className="text-gray-600 mb-2">{`Phone: ${addressItem.phone}`}</p>
                    {selectedShippingAddress?._id === addressItem._id && (
                      <p className="absolute top-2 -right-[34px] bg-blue-600 p-2 px-[27px] rounded text-white transform rotate-[48deg] shadow-md">
                        Selected
                      </p>
                    )}
                  </div>
                ))}
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              href={"/account/my-address/add-address"}
              className=" p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              add new address
            </Link>
          </div>
          <div className="self-end space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back{" "}
            </button>
            <button
              onClick={handleCheckout}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Checkout{" "}
            </button>
          </div>
        </div>
        <div className="flex flex-col rounded p-2 /px-4 ">
          <div>
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 items-center">
              <span>Tax (10%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <hr className="w-full my-1  h-[2px] bg-gray-300" />
            <div className="flex justify-between mb-2">
              <span>Total:</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
          </div>
          <hr className="w-full my-3 h-[2px] bg-gray-300" />

          <div className=" -mx-2">
            <h2 className="text-lg font-semibold mb-4 px-2">Cart Items</h2>
            <div className="h-[40vh] w-full overflow-auto no-scrollbar ">
              {cartItems.length > 0 &&
                cartItems.map((cartItem) => (
                  <div
                    key={cartItem._id.toString()}
                    className="flex items-center justify-between border-b py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <Image
                        width={40}
                        height={40}
                        src={imageSrc(cartItem)}
                        alt={cartItem.name}
                        style={{ objectFit: "cover" }}
                        className="w-16 h-16 object-cover rounded-lg"
                        priority
                      />
                      <div>
                        <h3 className="text-base font-normal">
                          {cartItem?.name?.substring(0, 30)}...
                        </h3>
                        <p className="text-gray-600">{`${
                          cartItem.quantity
                        } x $${(cartItem.discount
                          ? cartItem.price - cartItem.discount
                          : cartItem.price
                        ).toFixed(2)}`}</p>
                      </div>
                    </div>
                    <span>
                      $
                      {(
                        cartItem.quantity *
                        (cartItem.discount
                          ? cartItem.price - cartItem.discount
                          : cartItem.price)
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Shipping;
