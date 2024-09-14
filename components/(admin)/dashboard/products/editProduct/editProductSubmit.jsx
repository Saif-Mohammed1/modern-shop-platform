export default function EditProductSubmit({ prevStep, productData, onSubmit }) {
  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Confirm and Submit</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Product Name</h3>
        <p>{productData.name}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Category</h3>
        <p>{productData.category}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Price</h3>
        <p>{productData.price}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Stock</h3>
        <p>{productData.stock}</p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
        >
          Previous
        </button>
        <button
          onClick={onSubmit}
          className="w-1/2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
