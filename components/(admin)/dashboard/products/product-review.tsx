// product-review.tsx
import { useFormContext } from "react-hook-form";
import { FaInfoCircle } from "react-icons/fa";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Image from "next/image";
import type { PreviewFile } from "./addProduct";
import type { OldImage } from "@/app/lib/types/products.types";

export default function ProductReview({
  editMode = false,
}: {
  editMode?: boolean;
}) {
  const { getValues } = useFormContext();
  const values = getValues();

  const reviewSections = [
    {
      title:
        productsTranslate.products[lang].addProduct.form.productDetails.title,
      items: [
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview.name,
          value: values.name,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .category,
          value: values.category,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview.sku,
          value: values.sku,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .description,
          value: values.description,
        },
      ],
    },
    {
      title:
        productsTranslate.products[lang].addProduct.form.productPricing.title,
      items: [
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .price,
          value: `$${values.price}`,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .discount,
          value: `-$${values.discount}`,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .finalPrice,
          value: `$${values.price - values.discount}`,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productReview
              .discountExpire,
          value: values.discountExpire
            ? new Date(values.discountExpire).toLocaleDateString()
            : "N/A",
        },
      ],
    },
    {
      title:
        productsTranslate.products[lang].addProduct.form.productShipping.title,
      items: [
        {
          label:
            productsTranslate.products[lang].addProduct.form.productShipping
              .labels.weight,

          value: `${values.shippingInfo?.weight} ${
            productsTranslate.products[lang].addProduct.form.productShipping
              .labels.kg
          }`,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.productShipping
              .labels.dimensions,
          value: `${values.shippingInfo?.dimensions?.length}x${values.shippingInfo?.dimensions?.width}x${values.shippingInfo?.dimensions?.height} cm`,
        },
      ],
    },
    {
      title:
        productsTranslate.products[lang].addProduct.form.inventoryDetails.title,
      items: [
        {
          label:
            productsTranslate.products[lang].addProduct.form.inventoryDetails
              .labels.stock,

          value: values.stock,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.inventoryDetails
              .labels.reserved,
          value: values.reserved,
        },
        {
          label:
            productsTranslate.products[lang].addProduct.form.inventoryDetails
              .labels.sold,
          value: values.sold,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {" "}
      {editMode && (
        <div className="bg-yellow-100 p-3 rounded-lg mb-4">
          {productsTranslate.products[lang].editMode}
        </div>
      )}
      <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-3">
        <FaInfoCircle className="text-blue-600 text-xl" />
        <p className="text-blue-800">
          {
            productsTranslate.products[lang].addProduct.form.productSubmit
              .reviewText
          }
        </p>
      </div>
      {reviewSections.map((section, index) => (
        <div key={index} className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {section.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{item.value || "N/A"}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">
          {
            productsTranslate.products[lang].addProduct.form.productSubmit
              .ProductImages
          }
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {values.images?.map((file: OldImage | PreviewFile, index: number) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={typeof file === "string" ? file : file.link}
                alt={`Preview ${index + 1}`}
                width={150}
                height={150}
                className="rounded-lg object-cover aspect-square"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
