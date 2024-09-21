"use client";

import { useCartItems } from "@/components/context/cart.context";
import api from "@/components/util/axios.api";
import imageSrc from "@/components/util/productImageHandler";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
const AddAddressComponent = dynamic(() =>
  import("@/components/customer/address/addAddressReuseableComponent")
);

const ShippingComponentV3 = ({ address }) => {
  const { cartItems } = useCartItems(); // Assuming useCartItems is available
  const [addresses, setAddresses] = useState(address || []);

  const [selectedAddress, setSelectedAddress] = useState(
    addresses.length ? addresses[0] : ""
  );
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    country: "Ukraine",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Calculate subtotal of cart items
  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.discount && item.discountExpire > new Date().toISOString()
        ? item.price - item.discount
        : item.price) *
        item.quantity,
    0
  );
  const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 10);
  const feeDecimal = feePercentage / 100;

  // Calculate fee process.env.NEXT_PUBLIC_FEES_PERCENTAGE||(assuming 10%)
  const fee = subtotal * feeDecimal;

  // Calculate total amount (subtotal + fee)
  const totalAmount = subtotal + fee;
  const handleSelectAddress = (e) => {
    setSelectedAddress(
      addresses.find((address) => address._id === e.target.value)
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };

  const handleAddNewAddress = async () => {
    let toastLoading;

    if (
      !newAddress.street ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postalCode ||
      !newAddress.phone ||
      !newAddress.country
    ) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      toastLoading = toast.loading("Adding new address");
      const { data } = await api.post("/customer/address", newAddress);
      setAddresses((prevAddresses) => [...prevAddresses, data.data]);
      toast.success("Address added successfully");
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
        country: "Ukraine",
      });
      setSelectedAddress(data.data);
      setShowAddressForm(false);
    } catch (error) {
      toast.error(error?.message || error || "An unexpected error occurred");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handleCancelAddAddress = () => {
    setNewAddress({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      country: "Ukraine",
    });
    setShowAddressForm(false);
  };
  const handelCheckout = async () => {
    let toastLoading;
    if (!selectedAddress) {
      toast.error("Please select an address");
      return;
    }

    if (!cartItems.length) {
      toast.error("You have no items in your cart,please add some items");
      return;
    }

    try {
      toastLoading = toast.loading("Processing your order");
      const { data } = await api.post("/customer/orders", {
        shippingInfo: selectedAddress,
        products: cartItems,
      });
      toast.success("redirecting to payment page");
      window.open(data.url, "_blank");
    } catch (error) {
      toast.error(error?.message || error || "An unexpected error occurred");
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
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <select
          value={selectedAddress}
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
            <option value="">No addresses available</option>
          )}
        </select>

        {/* Toggle Address Form */}
        {showAddressForm ? (
          //   <div className="mb-4">
          //     <input
          //       type="text"
          //       name="street"
          //       value={newAddress.street}
          //       onChange={handleInputChange}
          //       placeholder="Street"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <input
          //       type="text"
          //       name="city"
          //       value={newAddress.city}
          //       onChange={handleInputChange}
          //       placeholder="City"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <input
          //       type="text"
          //       name="state"
          //       value={newAddress.state}
          //       onChange={handleInputChange}
          //       placeholder="State"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <input
          //       type="text"
          //       name="postalCode"
          //       value={newAddress.postalCode}
          //       onChange={handleInputChange}
          //       placeholder="Postal Code"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <input
          //       type="text"
          //       name="phone"
          //       value={newAddress.phone}
          //       onChange={handleInputChange}
          //       placeholder="Phone"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <input
          //       type="text"
          //       name="country"
          //       value={"Ukraine"}
          //       readOnly
          //       placeholder="Country"
          //       className="w-full p-2 border rounded-md mb-2"
          //     />
          //     <div className="flex gap-4">
          //       <button
          //         onClick={handleAddNewAddress}
          //         className="bg-blue-500 text-white px-4 py-2 rounded-md"
          //       >
          //         Add Address
          //       </button>
          //       <button
          //         onClick={handleCancelAddAddress}
          //         className="bg-red-500 text-white px-4 py-2 rounded-md"
          //       >
          //         Cancel
          //       </button>
          //     </div>
          //   </div>
          <AddAddressComponent
            handleAddAddress={handleAddNewAddress}
            onChange={handleInputChange}
            newAddress={newAddress}
            handleCancelAddAddress={handleCancelAddAddress}
          />
        ) : (
          <button
            onClick={() => setShowAddressForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Add New Address
          </button>
        )}
      </div>

      {/* Order Summary Section */}
      <div className="/lg:w-1/2 p-4 border rounded-lg shadow-lg w-full">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <div className="space-y-1 mb-4">
          <p className="text-lg">Subtotal: ${subtotal.toFixed(2)}</p>
          <p className="text-lg">
            Fee ({feePercentage}%): ${fee.toFixed(2)}
          </p>
          <hr class="w-full my-3 h-[2px] bg-gray-300" />
          <p className="text-xl font-semibold">
            Total: ${totalAmount.toFixed(2)}
          </p>
        </div>{" "}
        <hr class="w-full my-3 h-[2px] bg-gray-300" />
        <div className="flex gap-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md"
            onClick={handelCheckout}
          >
            Checkout
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
            Back
          </button>
        </div>{" "}
        <hr class="w-full my-3 h-[2px] bg-gray-300" />
        <div className="mb-4">
          <h3 className="text-lg font-semibold my-3">Cart Items:</h3>
          <div className="w-full max-h-[120vh] md:max-h-[70vh] overflow-y-auto mb-4">
            {cartItems.map((item, index) => {
              const price =
                item.discount && item.discountExpire > new Date().toISOString()
                  ? item.price - item.discount
                  : item.price;

              return (
                <div
                  key={index}
                  className="flex items-center border-b-2 py-2 gap-3"
                >
                  <Image
                    src={imageSrc(item)}
                    width={50}
                    height={50}
                    style={{ objectFit: "cover" }}
                    alt={item.name}
                    priority
                  />
                  <div className="w-full">
                    <p className="font-normal text-lg">{item.name}</p>

                    <p className="flex w-full justify-between items-center ">
                      <span className=" text-gray-700">
                        {item.quantity} x ${price}
                      </span>
                      <span> ${item.quantity * price}</span>
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
