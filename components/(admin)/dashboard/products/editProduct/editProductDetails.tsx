import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { ProductType, Event } from "@/app/types/products.types";
import { lang } from "@/components/util/lang";
import { ChangeEvent } from "react";

type EditProductDetailsProps = {
  productData: Partial<ProductType>;
  onChange: (e: Event) => void;
  handleNext: () => void;
  onTextAreaChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
};

const EditProductDetails = ({
  productData,
  onChange,
  handleNext,
  onTextAreaChange,
}: EditProductDetailsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productDetails
              .labels.name
          }
        </label>
        <input
          name="name"
          type="text"
          placeholder={
            productsTranslate.products[lang].editProduct.form.productDetails
              .placeholders.name
          }
          value={productData.name}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productDetails
              .labels.category
          }
        </label>
        <input
          name="category"
          type="text"
          placeholder={
            productsTranslate.products[lang].editProduct.form.productDetails
              .placeholders.category
          }
          value={productData.category}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productDetails
              .labels.description
          }
        </label>
        <textarea
          name="description"
          value={productData.description}
          onChange={onTextAreaChange}
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
        ></textarea>
      </div>
      <button
        onClick={handleNext}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-300"
      >
        {productsTranslate.products[lang].editProduct.form.button.next}
      </button>
    </div>
  );
};

export default EditProductDetails;
