const EditProductDetails = ({ productData, onChange, handleNext }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700">Name</label>
        <input
          name="name"
          type="text"
          value={productData.name}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">Category</label>
        <input
          name="category"
          type="text"
          value={productData.category}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">Description</label>
        <textarea
          name="description"
          value={productData.description}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
          rows="4"
        ></textarea>
      </div>
      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Next
      </button>
    </div>
  );
};

export default EditProductDetails;
