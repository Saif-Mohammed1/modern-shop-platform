import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";
import { useEffect, useState } from "react";
type ProductDetailsProps = {
  nextStep: () => void;
  setProductDetails: (details: {
    name: string;
    category: string;
    description: string;
  }) => void;
};
// export default function ProductDetails
export default function ProductDetails({
  nextStep,
  setProductDetails,
}: ProductDetailsProps) {
  const storedProductDetails = localStorage.getItem("productDetails");
  const productDetails = storedProductDetails
    ? JSON.parse(storedProductDetails)
    : {};

  const [name, setName] = useState(productDetails.name || "");
  const [category, setCategory] = useState(productDetails.category || "");
  const [description, setDescription] = useState(
    productDetails.description || ""
  );

  // Optionally, you can use useEffect to handle updates to localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedStoredDetails = localStorage.getItem("productDetails");
      const updatedDetails = updatedStoredDetails
        ? JSON.parse(updatedStoredDetails)
        : {};
      setName(updatedDetails.name || "");
      setCategory(updatedDetails.category || "");
      setDescription(updatedDetails.description || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
      <h2 className="text-2xl font-semibold mb-4">
        {productsTranslate.products[lang].addProduct.form.productDetails.title}
      </h2>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.productDetails
              .labels.name
          }
        </label>
        <input
          type="text"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productDetails
              .placeholders.name
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.productDetails
              .labels.category
          }
        </label>
        <input
          type="text"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productDetails
              .placeholders.category
          }
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {
            productsTranslate.products[lang].addProduct.form.productDetails
              .labels.description
          }
        </label>
        <textarea
          placeholder={
            productsTranslate.products[lang].addProduct.form.productDetails
              .placeholders.description
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        {productsTranslate.products[lang].addProduct.form.button.next}
      </button>
    </div>
  );
}
