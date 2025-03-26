"use client";

import { useCartItems } from "@/components/providers/context/cart/cart.context";
import api from "@/app/lib/utilities/api";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import type { Event } from "@/app/lib/types/products.types";
import { checkoutPageTranslate } from "@/public/locales/client/(public)/checkoutPageTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { AddressFormValues } from "@/components/customers/address/AddressForm";
import type { AddressType } from "@/app/lib/types/address.types";
const AddressForm = dynamic(
  () => import("@/components/customers/address/AddressForm")
);

const ShippingComponentV3 = ({ address }: { address: AddressType[] }) => {
  const { cartItems } = useCartItems(); // Assuming useCartItems is available
  const [addresses, setAddresses] = useState<AddressType[]>(address || []);

  const [selectedAddress, setSelectedAddress] = useState(
    addresses.length ? addresses[0] : ""
  );
  // const [newAddress, setNewAddress] = useState({
  //   street: "",
  //   city: "",
  //   state: "",
  //   postalCode: "",
  //   phone: "",
  //   country: "Ukraine",
  // });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Calculate subtotal of cart items
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.discount && item.discountExpire && item.discountExpire > new Date()
        ? item.price - item.discount
        : item.price) *
        item.quantity,
    0
  );
  const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
  const feeDecimal = feePercentage / 100;

  // Calculate fee process.env.NEXT_PUBLIC_FEES_PERCENTAGE||(assuming 10%)
  const fee = subtotal * feeDecimal;

  // Calculate total amount (subtotal + fee)
  const totalAmount = subtotal + fee;
  const handleSelectAddress = (e: Event) => {
    const selectedAddress = addresses.find(
      (address) => address._id === e.target.value
    );
    if (selectedAddress) {
      setSelectedAddress(selectedAddress);
    }
  };

  // const handleInputChange = (e: Event) => {
  //   const { name, value } = e.target;
  //   setNewAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  // };

  const handleFormSubmit = async (data: AddressFormValues) => {
    let toastLoading;

    try {
      toastLoading = toast.loading(
        checkoutPageTranslate[lang].functions.handleAddNewAddress.loading
      );
      const { data: newAddress } = await api.post("/customers/address", data);
      setAddresses((prevAddresses) => [...prevAddresses, newAddress]);
      toast.success(
        checkoutPageTranslate[lang].functions.handleAddNewAddress.success
      );

      setSelectedAddress(newAddress);
      setShowAddressForm(false);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : checkoutPageTranslate[lang].errors.global;

      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handelCheckout = async () => {
    let toastLoading;
    if (!selectedAddress) {
      toast.error(
        checkoutPageTranslate[lang].functions.handelCheckout.selectAddress
      );
      return;
    }

    if (!cartItems.length) {
      toast.error(
        checkoutPageTranslate[lang].functions.handelCheckout.emptyCartMessage
      );
      return;
    }

    try {
      toastLoading = toast.loading(
        checkoutPageTranslate[lang].functions.handelCheckout.loading
      );
      const { data } = await api.post("/customers/orders", {
        shippingInfo: selectedAddress,
        // products: cartItems,
      });
      toast.success(
        checkoutPageTranslate[lang].functions.handelCheckout.success
      );
      window.open(data.url, "_blank");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : checkoutPageTranslate[lang].errors.global;

      toast.error(errorMessage);
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  useEffect(() => {
    setAddresses(address);
  }, [address]);
  return (
    <div className="flex flex-col lg:flex-row gap-6 ">
      {/* Address Section */}
      <div className="/lg:w-1/2  p-4 border rounded-lg shadow-lg ">
        <h2 className="text-xl font-semibold mb-4">
          {checkoutPageTranslate[lang].title}
        </h2>
        <select
          value={
            typeof selectedAddress === "object" ? selectedAddress?._id : ""
          }
          onChange={handleSelectAddress}
          className="w-full p-2 border rounded-md mb-4"
        >
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <option key={address._id} value={address._id}>
                {`${address.street}, ${address.city}, ${address.state}, ${address.country}, Phone: ${address.phone}`}
              </option>
            ))
          ) : (
            <option value="">
              {checkoutPageTranslate[lang].body.select.noAddress}
            </option>
          )}
        </select>

        {/* Toggle Address Form */}
        {showAddressForm ? (
          <AddressForm
            onSubmit={handleFormSubmit}
            onCancel={() => setShowAddressForm(false)}
            // defaultValues={
          />
        ) : (
          <button
            onClick={() => setShowAddressForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            {checkoutPageTranslate[lang].button.addNewAddress}
          </button>
        )}
      </div>

      {/* Order Summary Section */}
      <div className="/lg:w-1/2 p-4 border rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-semibold mb-4">
          {checkoutPageTranslate[lang].body.order.summery}
        </h2>
        <div className="space-y-1 mb-4">
          <p className="text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="text-lg">
            {checkoutPageTranslate[lang].body.order.fee} ({feePercentage}%): $
            {fee.toFixed(2)}
          </p>
          <hr className="w-full my-3 h-[2px] bg-gray-300" />
          <p className="text-xl font-semibold">
            {checkoutPageTranslate[lang].body.order.total}: $
            {totalAmount.toFixed(2)}
          </p>
        </div>{" "}
        <hr className="w-full my-3 h-[2px] bg-gray-300" />
        <div className="flex gap-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md"
            onClick={handelCheckout}
          >
            {checkoutPageTranslate[lang].button.checkout}
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
            {checkoutPageTranslate[lang].button.back}
          </button>
        </div>{" "}
        <hr className="w-full my-3 h-[2px] bg-gray-300" />
        <div className="mb-4">
          <h3 className="text-lg font-semibold my-3">
            {checkoutPageTranslate[lang].body.cartItems}:
          </h3>
          <div className="w-full max-h-[120vh] md:max-h-[70vh] overflow-y-auto mb-4">
            {cartItems.map((item, index) => {
              const price =
                item.discount &&
                item.discountExpire &&
                item.discountExpire > new Date()
                  ? item.price - item.discount
                  : item.price;

              return (
                <div
                  key={index}
                  className="flex items-center border-b-2 py-2 gap-3"
                >
                  <div
                    className="imgParent"
                    style={{ width: "100px", height: "100px" }}
                  >
                    <Image
                      src={imageSrc(item)}
                      width={50}
                      height={50}
                      style={{ objectFit: "cover" }}
                      alt={item.name}
                      priority
                    />
                  </div>
                  <div className="w-full">
                    <p className="font-normal text-lg">{item.name}</p>

                    <p className="flex w-full justify-between items-center ">
                      <span className=" text-gray-700">
                        {item.quantity} x ${parseFloat(price.toFixed(2))}
                      </span>
                      <span>
                        {" "}
                        ${parseFloat((item.quantity * price).toFixed(2))}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingComponentV3;

// export default CheckoutPage;
