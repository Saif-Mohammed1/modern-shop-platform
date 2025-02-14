import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
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
        <p>{productDetails.name}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {
            productsTranslate.products[lang].addProduct.form.productSubmit
              .category
          }
        </h3>
        <p>{productDetails.category}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {productsTranslate.products[lang].addProduct.form.productSubmit.price}
        </h3>
        <p>{pricingDetails.price}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {productsTranslate.products[lang].addProduct.form.productSubmit.stock}
        </h3>
        <p>{inventoryDetails.stock}</p>
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
