import api from "@/components/util/axios.api";
import { toast } from "react-hot-toast";
export default function ProductSubmit({
  prevStep,
  productDetails,
  pricingDetails,
  inventoryDetails,
  imageDetails,
}) {
  const handleSubmit = async () => {
    let toastLoading;

    const productData = {
      ...productDetails,
      ...pricingDetails,
      ...inventoryDetails,
      ...imageDetails,
    };
    if (
      !productData.name ||
      !productData.category ||
      !productData.price ||
      !productData.stock ||
      !productData.images
    ) {
      return toast.error("Please fill all fields");
    }
    try {
      toastLoading = toast.loading("Adding product...");
      await api.post("/admin/dashboard/products/", productData);
      toast.success("Product added successfully");
      localStorage.removeItem("productDetails");
      localStorage.removeItem("images");
      localStorage.removeItem("inventoryDetails");
      localStorage.removeItem("pricingDetails");
    } catch (error) {
      toast.error(error?.message || error || "An unexpected error occurred");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Confirm and Submit</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Product Name</h3>
        <p>
          {productDetails.name ||
            JSON.parse(localStorage.getItem("productDetails")).name}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Category</h3>
        <p>
          {productDetails.category ||
            JSON.parse(localStorage.getItem("productDetails")).category}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Price</h3>
        <p>
          {pricingDetails.price ||
            JSON.parse(localStorage.getItem("pricingDetails")).price}
        </p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">Stock</h3>
        <p>
          {inventoryDetails.stock ||
            JSON.parse(localStorage.getItem("inventoryDetails")).stock}
        </p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
