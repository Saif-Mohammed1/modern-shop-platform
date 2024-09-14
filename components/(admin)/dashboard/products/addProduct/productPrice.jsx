import { useState } from "react";
import ButtonSteps from "./ButtonSteps";

export default function ProductPricing({
  nextStep,
  prevStep,
  setPricingDetails,
}) {
  const [price, setPrice] = useState(
    localStorage.getItem("pricingDetails")
      ? Number(JSON.parse(localStorage.getItem("pricingDetails")).price)
      : ""
  );
  const [discount, setDiscount] = useState(
    localStorage.getItem("pricingDetails")
      ? Number(JSON.parse(localStorage.getItem("pricingDetails")).discount)
      : ""
  );
  const [discountExpire, setDiscountExpire] = useState(
    localStorage.getItem("pricingDetails")
      ? JSON.parse(localStorage.getItem("pricingDetails")).discountExpire
      : ""
  );

  const handleNext = () => {
    setPricingDetails({ price, discount, discountExpire });
    nextStep();
    localStorage.setItem(
      "pricingDetails",
      JSON.stringify({ price, discount, discountExpire })
    );
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Pricing</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Price</label>
        <input
          name="price"
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Discount</label>
        <input
          name="discount"
          type="number"
          placeholder="Enter discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {discount > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            discountExpire
          </label>
          <input
            name="discountExpire"
            type="date"
            placeholder="Enter discount"
            value={discountExpire}
            onChange={(e) => setDiscountExpire(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <ButtonSteps prevStep={prevStep} handleNext={handleNext} />
    </div>
  );
}
