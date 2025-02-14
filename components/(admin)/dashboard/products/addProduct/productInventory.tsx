import { useEffect, useState } from "react";
import ButtonSteps from "./ButtonSteps";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
type ProductInventoryProps = {
  nextStep: () => void;
  prevStep: () => void;
  setInventoryDetails: (inventoryDetails: any) => void;
};

export default function ProductInventory({
  nextStep,
  prevStep,
  setInventoryDetails,
}: ProductInventoryProps) {
  const [stock, setStock] = useState("");

  const handleNext = () => {
    setInventoryDetails({ stock });
    nextStep();
    localStorage.setItem("inventoryDetails", JSON.stringify({ stock }));
  };
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedStoredDetails = localStorage.getItem("inventoryDetails");
      const updatedDetails = updatedStoredDetails
        ? JSON.parse(updatedStoredDetails)
        : {};
      setStock(updatedDetails.stock || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {
          productsTranslate.products[lang].addProduct.form.inventoryDetails
            .title
        }
      </h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.inventoryDetails
              .labels.stock
          }
        </label>
        <input
          type="number"
          placeholder={
            productsTranslate.products[lang].addProduct.form.inventoryDetails
              .placeholders.stock
          }
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <ButtonSteps prevStep={prevStep} handleNext={handleNext} />
    </div>
  );
}
