import ButtonSteps from "../addProduct/ButtonSteps";

const EditProductPrice = ({ productData, onChange, prevStep, handleNext }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700">Price</label>
        <input
          name="price"
          type="number"
          value={productData.price}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">Discount</label>
        <input
          name="discount"
          type="number"
          value={productData.discount}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">DiscountExpire</label>
        <input
          name="discountExpire"
          type="date"
          value={
            new Date(productData.discountExpire).toISOString().split("T")[0] ||
            ""
          }
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <ButtonSteps prevStep={prevStep} handleNext={handleNext} />
    </div>
  );
};

export default EditProductPrice;
