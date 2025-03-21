// product-inventory.tsx
import { lang } from "@/app/lib/utilities/lang";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { useFormContext } from "react-hook-form";
import { FaCube, FaBoxes, FaChartLine } from "react-icons/fa";

export default function ProductInventory({
  editMode = false,
}: {
  editMode?: boolean;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      {" "}
      {editMode && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      )}
      <div className="grid grid-cols-3 gap-4">
        <div className="form-group">
          <label className="form-label">
            <FaCube className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.inventoryDetails
                .labels.stock
            }
          </label>
          <input
            type="number"
            {...register("stock", { required: true, min: 0 })}
            className="form-input"
          />
          {errors.stock && (
            <span className="form-error">
              {
                productsTranslate.products[lang].addProduct.form
                  .inventoryDetails.placeholders.required
              }
            </span>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaBoxes className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.inventoryDetails
                .labels.reserved
            }
          </label>
          <input
            type="number"
            {...register("reserved", { min: 0 })}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaChartLine className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.inventoryDetails
                .labels.sold
            }
          </label>
          <input
            type="number"
            {...register("sold", { min: 0 })}
            className="form-input"
          />
        </div>
      </div>
    </div>
  );
}
