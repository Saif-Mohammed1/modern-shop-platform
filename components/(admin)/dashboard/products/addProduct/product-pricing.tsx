import { useFormContext } from "react-hook-form";
import { FaDollarSign, FaTag, FaCalendarAlt } from "react-icons/fa";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { useEffect } from "react";

export default function ProductPricing({
  editMode = false,
}: {
  editMode?: boolean;
}) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const price = watch("price");
  const discount = watch("discount");
  const discountExpire = watch("discountExpire");

  // Convert ISO string to date input format
  useEffect(() => {
    if (discountExpire) {
      const formattedDate = new Date(discountExpire)
        .toISOString()
        .split("T")[0];
      setValue("discountExpire", formattedDate);
    }
    if (discount) {
      setValue("discount", Number(discount).toFixed(2));
    }
  }, [discountExpire, setValue, discount]);

  // Calculate discounted price
  const discountedPrice =
    price && discount ? (Number(price) - Number(discount)).toFixed(2) : null;

  return (
    <div className="space-y-6">
      {editMode && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">
          <FaDollarSign className="form-icon" />
          {
            productsTranslate.products[lang].addProduct.form.productPricing
              .labels.price
          }
        </label>
        <input
          type="number"
          step="0.01"
          {...register("price", {
            required: true,
            min: 0.01,
          })}
          className="form-input"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productPricing
              .placeholders.price
          }
        />
        {errors.price && (
          <span className="form-error">
            {productsTranslate.products[lang].addProduct.form.errors.price}
          </span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">
          <FaTag className="form-icon" />
          {
            productsTranslate.products[lang].addProduct.form.productPricing
              .labels.discount
          }
        </label>
        <input
          type="number"
          step="0.01"
          {...register("discount", {
            min: 0,
            validate: (value) =>
              value <= price || "Discount cannot exceed price",
          })}
          className="form-input"
          placeholder={
            productsTranslate.products[lang].addProduct.form.productPricing
              .placeholders.discount
          }
        />
        {errors.discount && (
          <span className="form-error">
            {typeof errors.discount.message === "string"
              ? errors.discount.message
              : productsTranslate.products[lang].addProduct.form.errors
                  .discount}
          </span>
        )}

        {/* Price display */}
        {discountedPrice && (
          <div className="mt-2 text-sm">
            <span className="text-gray-500 line-through mr-2">
              ${Number(price).toFixed(2)}
            </span>
            <span className="text-green-600 font-semibold">
              ${discountedPrice}
            </span>
          </div>
        )}
      </div>

      {discount > 0 && (
        <div className="form-group">
          <label className="form-label">
            <FaCalendarAlt className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.productPricing
                .labels.discountExpire
            }
          </label>
          <input
            type="date"
            {...register("discountExpire", {
              validate: (value) => new Date(value) > new Date(),
            })}
            className="form-input"
          />
          {errors.discountExpire && (
            <span className="form-error">
              {
                productsTranslate.products[lang].addProduct.form.errors
                  .discountExpire
              }
            </span>
          )}
        </div>
      )}
    </div>
  );
}
