import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import api from "@/components/util/axios.api";
import { lang } from "@/components/util/lang";
import { toast } from "react-hot-toast";

type ProductSubmitProps = {
  prevStep: () => void;
  productDetails: {
    name: string;
    category: string;
  };
  pricingDetails: {
    price: number;
  };
  inventoryDetails: {
    stock: number;
  };
  imageDetails: {
    images: string[];
  };
};
export default function ProductSubmit({
  prevStep,
  productDetails,
  pricingDetails,
  inventoryDetails,
  imageDetails,
}: ProductSubmitProps) {
  const storedProductDetails = localStorage.getItem("productDetails");
  const getProductDetails = storedProductDetails
    ? JSON.parse(storedProductDetails)
    : {};
  const storedPricingDetails = localStorage.getItem("pricingDetails");
  const getPricingDetails = storedPricingDetails
    ? JSON.parse(storedPricingDetails)
    : {};
  const storedInventoryDetails = localStorage.getItem("inventoryDetails");
  const getInventoryDetails = storedInventoryDetails
    ? JSON.parse(storedInventoryDetails)
    : {};

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
      return toast.error(productsTranslate.products[lang].error.fields);
    }
    try {
      toastLoading = toast.loading(
        productsTranslate.products[lang].addProduct.form.productSubmit.loading
      );
      await api.post("/admin/dashboard/products/", productData);
      toast.success(
        productsTranslate.products[lang].addProduct.form.productSubmit.success
      );
      localStorage.removeItem("productDetails");
      localStorage.removeItem("images");
      localStorage.removeItem("inventoryDetails");
      localStorage.removeItem("pricingDetails");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message || productsTranslate.products[lang].error.general
        );
      } else {
        toast.error(productsTranslate.products[lang].error.general);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        {productsTranslate.products[lang].addProduct.form.productSubmit.title}
      </h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {
            productsTranslate.products[lang].addProduct.form.productSubmit
              .productName
          }
        </h3>
        <p>{productDetails.name || getProductDetails.name}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {
            productsTranslate.products[lang].addProduct.form.productSubmit
              .category
          }
        </h3>
        <p>{productDetails.category || getProductDetails.category}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {productsTranslate.products[lang].addProduct.form.productSubmit.price}
        </h3>
        <p>{pricingDetails.price || getPricingDetails.price}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {productsTranslate.products[lang].addProduct.form.productSubmit.stock}
        </h3>
        <p>{inventoryDetails.stock || getInventoryDetails.stock}</p>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="w-1/2 bg-gray-200 text-gray-700 py-2 rounded-lg mr-2 hover:bg-gray-300 transition duration-300"
        >
          {productsTranslate.products[lang].addProduct.form.button.previous}
        </button>
        <button
          onClick={handleSubmit}
          className="w-1/2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition duration-300"
        >
          {productsTranslate.products[lang].addProduct.form.button.submit}
        </button>
      </div>
    </div>
  );
}
