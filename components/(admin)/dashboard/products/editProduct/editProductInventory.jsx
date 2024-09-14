import React from "react";
import ButtonSteps from "../addProduct/ButtonSteps";

const EditProductInventory = ({
  productData,
  onChange,
  prevStep,
  handleNext,
}) => {
  return (
    <div>
      <label className="block text-gray-700">Stock</label>
      <input
        name="stock"
        type="number"
        value={productData.stock}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <ButtonSteps
        prevStep={prevStep}
        handleNext={handleNext}
        parentStyle={"mt-6"}
      />
    </div>
  );
};

export default EditProductInventory;
