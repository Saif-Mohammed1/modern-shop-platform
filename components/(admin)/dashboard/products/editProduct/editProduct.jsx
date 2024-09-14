"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EditProductDetails from "./editProductDetails";
import EditProductPrice from "./editProductPrice";
import EditProductInventory from "./editProductInventory";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";
import EditProductImages from "./editProductImages";
import EditProductSubmit from "./editProductSubmit";

const EditProduct = ({ product }) => {
  const {
    name,
    category,
    description,
    price,
    discount,
    discountExpire,
    stock,
  } = product;

  const [currentStep, setCurrentStep] = useState(1); // For navigation between sections
  const [productData, setProductData] = useState({
    name,
    category,
    description,
    price,
    discount,
    discountExpire,
    stock,
  });
  const [oldImages, setOldImages] = useState(product.images || []);
  const [newImages, setNewImages] = useState([]);
  const nextStep = () => setCurrentStep(currentStep + 1);
  const prevStep = () => setCurrentStep(currentStep - 1);

  const onInputChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const router = useRouter();

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Send updated data to backend
    let toastLoading;
    let updatedData = {};
    for (let key in productData) {
      if (productData[key] !== product[key]) {
        updatedData[key] = productData[key];
      }
    }
    if (newImages.length > 0) {
      updatedData.images = newImages;
    }
    if (Object.keys(updatedData).length === 0) {
      return toast.error("No changes were made");
    }
    try {
      toastLoading = toast.loading("Updating Product...");
      await api.put(`/admin/dashboard/products/${product._id}`, updatedData);
      toast.success("Product Updated Successfully");
      router.push("/dashboard/products?name=" + productData.name);
    } catch (error) {
      toast.error(error?.message || "An error occurred");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const removeOldImages = async (public_id) => {
    // let confirm = window.confirm("Are you sure you want to delete this image?");
    let toastLoading;
    try {
      toastLoading = toast.loading("Deleting Image...");

      await api.post(
        "/admin/dashboard/products/" + product._id + "/removeImage",
        { public_id }
      );
      setOldImages(oldImages.filter((img) => img.public_id !== public_id));
      toast.success("Image Deleted Successfully");
    } catch (error) {
      toast.error(error?.message || "An error occurred");
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  switch (currentStep) {
    case 1:
      return (
        <EditProductDetails
          productData={productData}
          onChange={onInputChange}
          handleNext={nextStep}
        />
      );
    case 2:
      return (
        <EditProductPrice
          productData={productData}
          onChange={onInputChange}
          handleNext={nextStep}
          prevStep={prevStep}
        />
      );
    case 3:
      return (
        <EditProductInventory
          handleNext={nextStep}
          prevStep={prevStep}
          productData={productData}
          onChange={onInputChange}
        />
      );
    case 4:
      return (
        <EditProductImages
          oldImages={oldImages}
          newImages={newImages}
          setNewImages={setNewImages}
          removeOldImages={removeOldImages}
          handleNext={nextStep}
          prevStep={prevStep}
        />
      );
    case 5:
      return (
        <EditProductSubmit
          productData={productData}
          prevStep={prevStep}
          onSubmit={handleSubmit}
        />
      );
    default:
      return (
        <div className="m-auto text-red-500">
          <FaTimesCircle className="text-6xl mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Unknown Step</h2>
          <p className="text-gray-600 mb-6">
            Unfortunately, an error occurred. Please go back to previous step or
            contact support.
          </p>
        </div>
      );
  }
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Edit Product</h1>

      <div className="mb-6">
        <button
          className={`px-4 py-2 rounded ${
            currentStep === 1 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCurrentStep(1)}
        >
          Basic Information
        </button>
        <button
          className={`px-4 py-2 rounded ml-4 ${
            currentStep === 2 ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCurrentStep(2)}
        >
          Pricing & Stock
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                value={productData.name}
                onChange={(e) =>
                  setProductData({ ...productData, name: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700">Category</label>
              <input
                type="text"
                value={productData.category}
                onChange={(e) =>
                  setProductData({ ...productData, category: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700">Description</label>
              <textarea
                value={productData.description}
                onChange={(e) =>
                  setProductData({
                    ...productData,
                    description: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
              ></textarea>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Price</label>
              <input
                type="number"
                value={productData.price}
                onChange={(e) =>
                  setProductData({ ...productData, price: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700">Discount</label>
              <input
                type="number"
                value={productData.discount}
                onChange={(e) =>
                  setProductData({ ...productData, discount: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-gray-700">Stock</label>
              <input
                type="number"
                value={productData.stock}
                onChange={(e) =>
                  setProductData({ ...productData, stock: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save Changes
          </button>
          <Link href="/dashboard/products" className="ml-4 text-blue-500">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
