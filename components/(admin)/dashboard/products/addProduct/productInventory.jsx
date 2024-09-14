import { useState } from "react";
import ButtonSteps from "./ButtonSteps";

export default function ProductInventory({
  nextStep,
  prevStep,
  setInventoryDetails,
}) {
  const [stock, setStock] = useState(
    localStorage.getItem("inventoryDetails")
      ? JSON.parse(localStorage.getItem("inventoryDetails")).stock
      : ""
  );

  const handleNext = () => {
    setInventoryDetails({ stock });
    nextStep();
    localStorage.setItem("inventoryDetails", JSON.stringify({ stock }));
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Inventory</h2>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">Stock</label>
        <input
          type="number"
          placeholder="Enter stock quantity"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <ButtonSteps prevStep={prevStep} handleNext={handleNext} />
    </div>
  );
}
