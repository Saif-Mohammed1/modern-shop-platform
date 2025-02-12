import { productsTranslate } from "@/app/_translate/(auth)/(admin)/dashboard/productTranslate";
import ButtonSteps from "../addProduct/ButtonSteps";
import { lang } from "@/app/lib/util/lang";
import { ProductType, Event } from "@/app/lib/types/products.types";

type EditProductPriceProps = {
  productData: Partial<ProductType>;
  onChange: (e: Event) => void;
  prevStep: () => void;
  handleNext: () => void;
};

const EditProductPrice = ({
  productData,
  onChange,
  prevStep,
  handleNext,
}: EditProductPriceProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productPricing
              .labels.price
          }
        </label>
        <input
          name="price"
          type="number"
          placeholder={
            productsTranslate.products[lang].editProduct.form.productPricing
              .placeholders.price
          }
          value={productData.price}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productPricing
              .labels.discount
          }
        </label>
        <input
          name="discount"
          type="number"
          placeholder={
            productsTranslate.products[lang].editProduct.form.productPricing
              .placeholders.discount
          }
          value={productData.discount}
          onChange={onChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label className="block text-gray-700">
          {
            productsTranslate.products[lang].editProduct.form.productPricing
              .labels.discountExpire
          }
        </label>
        <input
          name="discountExpire"
          type="date"
          placeholder={
            productsTranslate.products[lang].editProduct.form.productPricing
              .placeholders.discountExpire
          }
          value={
            productData.discountExpire
              ? new Date(productData.discountExpire).toISOString().split("T")[0]
              : ""
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
