// product-details.tsx
import { useFormContext } from "react-hook-form";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { FaBox, FaAlignLeft } from "react-icons/fa";

export default function ProductDetails({
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
      {editMode && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          <FaBox className="form-icon" />
          {
            productsTranslate.products[lang].addProduct.form.productDetails
              .labels.name
          }
        </label>
        <input
          {...register("name", { required: true })}
          className="form-input"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productDetails
              .placeholders.name
          }
        />
        {errors.name && (
          <span className="form-error">This field is required</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="form-label">
            <FaBox className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.productDetails
                .labels.category
            }
          </label>
          <input
            {...register("category", { required: true })}
            className="form-input"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productDetails
                .placeholders.category
            }
          />
        </div>

        <div className="form-group">
          <label className="form-label">
            <FaBox className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.productDetails
                .labels.sku
            }
          </label>
          <input
            {...register("sku", { required: true })}
            className="form-input"
            placeholder={
              productsTranslate.products[lang].addProduct.form.productDetails
                .placeholders.sku
            }
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">
          <FaAlignLeft className="form-icon" />
          {
            productsTranslate.products[lang].addProduct.form.productDetails
              .labels.description
          }
        </label>
        <textarea
          {...register("description", { required: true })}
          className="form-input h-32"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productDetails
              .placeholders.description
          }
        />
      </div>
    </div>
  );
}
