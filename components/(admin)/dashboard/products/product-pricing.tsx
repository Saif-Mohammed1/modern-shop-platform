import { DateTime } from "luxon";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { FaCalendarAlt, FaDollarSign, FaTag } from "react-icons/fa";

import { lang } from "@/app/lib/utilities/lang";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

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
  const discount_expire = watch("discount_expire");

  // Convert ISO string to date input format
  useEffect(() => {
    if (discount_expire) {
      const formatted = DateTime.fromFormat(
        discount_expire,
        "dd/MM/yyyy"
      ).toISO();
      let formattedDate = formatted;
      if (formatted) {
        formattedDate = new Date(formatted).toISOString().split("T")[0];
        setValue("discount_expire", formattedDate);
      }
    }
    if (discount) {
      setValue("discount", Number(discount).toFixed(2));
    }
  }, [discount_expire, setValue, discount]);

  // Calculate discounted price
  const discountedPrice =
    price && discount ? (Number(price) - Number(discount)).toFixed(2) : null;

  return (
    <div className="space-y-6">
      {editMode ? (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      ) : null}

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
        {errors.price ? (
          <span className="form-error">
            {productsTranslate.products[lang].addProduct.form.errors.price}
          </span>
        ) : null}
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
        {errors.discount ? (
          <span className="form-error">
            {typeof errors.discount.message === "string"
              ? errors.discount.message
              : productsTranslate.products[lang].addProduct.form.errors
                  .discount}
          </span>
        ) : null}

        {/* Price display */}
        {discountedPrice ? (
          <div className="mt-2 text-sm">
            <span className="text-gray-500 line-through mr-2">
              ${Number(price).toFixed(2)}
            </span>
            <span className="text-green-600 font-semibold">
              ${discountedPrice}
            </span>
          </div>
        ) : null}
      </div>

      {discount > 0 && (
        <div className="form-group">
          <label className="form-label">
            <FaCalendarAlt className="form-icon" />
            {
              productsTranslate.products[lang].addProduct.form.productPricing
                .labels.discount_expire
            }
          </label>
          <input
            type="date"
            {...register("discount_expire", {
              // validate: (value) => new Date(value) > new Date(),
            })}
            className="form-input"
          />
          {errors.discount_expire ? (
            <span className="form-error">
              {
                productsTranslate.products[lang].addProduct.form.errors
                  .discount_expire
              }
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
