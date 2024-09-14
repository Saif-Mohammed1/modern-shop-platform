import { useState } from "react";

export default function ProductDetails({ nextStep, setProductDetails }) {
  const [name, setName] = useState(
    localStorage.getItem("productDetails")
      ? JSON.parse(localStorage.getItem("productDetails")).name
      : ""
  );
  const [category, setCategory] = useState(
    localStorage.getItem("productDetails")
      ? JSON.parse(localStorage.getItem("productDetails")).category
      : ""
  );
  const [description, setDescription] = useState(
    localStorage.getItem("productDetails")
      ? JSON.parse(localStorage.getItem("productDetails")).description
      : ""
  );

  const handleNext = () => {
    setProductDetails({ name, category, description });
    nextStep();
    localStorage.setItem(
      "productDetails",
      JSON.stringify({ name, category, description })
    );
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Product Details</h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Product Name
        </label>
        <input
          type="text"
          placeholder="Enter product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Category</label>
        <input
          type="text"
          placeholder="Enter category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          placeholder="Enter product description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        Next
      </button>
    </div>
  );
}
