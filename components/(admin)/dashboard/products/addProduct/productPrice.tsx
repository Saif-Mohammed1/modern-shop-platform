import { useEffect, useState } from "react";
import ButtonSteps from "./ButtonSteps";
import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";

type ProductPricingProps = {
  nextStep: () => void;
  prevStep: () => void;
  setPricingDetails: (details: {
    price: number;
    discount: number;
    discountExpire: string;
  }) => void;
};
const storedPricingDetails = localStorage.getItem("pricingDetails");
const pricingDetails = storedPricingDetails
  ? JSON.parse(storedPricingDetails)
  : {};
export default function productPricing({
  nextStep,
  prevStep,
  setPricingDetails,
}: ProductPricingProps) {
  const [price, setPrice] = useState(pricingDetails.price || "");
  const [discount, setDiscount] = useState(pricingDetails.discount || "");
  const [discountExpire, setDiscountExpire] = useState(
    pricingDetails.discountExpire || ""
  );

  const handleNext = () => {
    setPricingDetails({ price, discount, discountExpire });
    nextStep();
    localStorage.setItem(
      "pricingDetails",
      JSON.stringify({ price, discount, discountExpire })
    );
  };
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedStoredDetails = localStorage.getItem("pricingDetails");
      const updatedDetails = updatedStoredDetails
        ? JSON.parse(updatedStoredDetails)
        : {};
      setPrice(updatedDetails.price || "");
      setDiscount(updatedDetails.discount || "");
      setDiscountExpire(updatedDetails.discountExpire || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {productsTranslate.products[lang].addProduct.form.productPricing.title}
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.productPricing
              .labels.price
          }
        </label>
        <input
          name="price"
          type="number"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productPricing
              .placeholders.price
          }
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.productPricing
              .labels.discount
          }
        </label>
        <input
          name="discount"
          type="number"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productPricing
              .placeholders.discount
          }
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {discount > 0 && (
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            {
              productsTranslate.products[lang].addProduct.form.productPricing
                .labels.discountExpire
            }{" "}
          </label>
          <input
            name="discountExpire"
            type="date"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productPricing
                .placeholders.discountExpire
            }
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
