import { lang } from "@/components/util/lang";
import ButtonSteps from "../addProduct/ButtonSteps";
import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { ProductType, Event } from "@/app/types/products.types";

type EditProductInventoryProps = {
  productData: Partial<ProductType>;
  onChange: (e: Event) => void;
  prevStep: () => void;
  handleNext: () => void;
};
const EditProductInventory = ({
  productData,
  onChange,
  prevStep,
  handleNext,
}: EditProductInventoryProps) => {
  return (
    <div>
      <label className="block text-gray-700">
        {
          productsTranslate.products[lang].editProduct.form.inventoryDetails
            .labels.stock
        }
      </label>
      <input
        name="stock"
        type="number"
        placeholder={
          productsTranslate.products[lang].editProduct.form.inventoryDetails
            .placeholders.stock
        }
        value={productData.stock}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded"
      />
      <ButtonSteps
        prevStep={prevStep}
        handleNext={handleNext}
        parentStyle={"mt-6"}
      />
    </div>
  );
};

export default EditProductInventory;
