// components/products/EditProductForm.tsx
"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import type { ProductType } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

import FormProgress from "./form-progress";
import FormControls from "./FormControls";
import ProductDetails from "./product-details";
import ProductImages from "./product-images";
import ProductInventory from "./product-inventory";
import ProductPricing from "./product-pricing";
import ProductReview from "./product-review";
import ProductShipping from "./product-shipping";

// GraphQL Mutation
const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($_id: String!, $product: ProductInput!) {
    updateProduct(_id: $_id, product: $product) {
      _id
      name
      slug
      category
      price
      discount
      discount_expire
      description
      stock
      sku
      images {
        link
        public_id
      }
      shipping_info {
        weight
        dimensions {
          length
          width
          height
        }
      }
      active
      updated_at
    }
  }
`;

// GraphQL response type
interface UpdateProductResponse {
  updateProduct: ProductType;
}

interface EditProductFormProps {
  defaultValues: ProductType;
}

export default function EditProductForm({
  defaultValues,
}: EditProductFormProps) {
  const methods = useForm<ProductType>({ defaultValues });
  const [step, setStep] = useState(1);
  const totalSteps = 6;
  const router = useRouter();

  // GraphQL mutation
  const [updateProduct] = useMutation<UpdateProductResponse>(UPDATE_PRODUCT, {
    onCompleted: (_data) => {
      toast.success(
        productsTranslate.products[lang].editProduct.form.productSubmit.success
      );
      router.push(`/dashboard/products?search=${defaultValues.name}`);
    },
    onError: (error) => {
      // Extract specific error message if available
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        productsTranslate.products[lang].error.general;

      toast.error(errorMessage);
    },
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    if (step === totalSteps) {
      // Filter out file objects from images (keep only uploaded images)
      if (data.images) {
        data.images = data.images.filter((img) => !(typeof img === "object"));
      }

      try {
        // Generate slug from name if not provided
        const slug =
          data.slug ||
          data.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        // Prepare product data for mutation
        const productInput = {
          name: data.name,
          slug,
          category: data.category,
          price: Number(data.price),
          discount: Number(data.discount) || 0,
          discount_expire: data.discount_expire || null,
          description: data.description,
          stock: Number(data.stock),
          sku: data.sku,
          images:
            data.images?.map((img: any) => ({
              link: (img as { link: string }).link,
              public_id: (img as { public_id: string }).public_id,
            })) || [],
          shipping_info: {
            weight: Number(data.shipping_info?.weight) || 0,
            dimensions: {
              length: Number(data.shipping_info?.dimensions?.length) || 0,
              width: Number(data.shipping_info?.dimensions?.width) || 0,
              height: Number(data.shipping_info?.dimensions?.height) || 0,
            },
          },
          reserved: Number(data.reserved) || 0,
          sold: Number(data.sold) || 0,
        };

        await updateProduct({
          variables: {
            _id: defaultValues._id,
            product: productInput,
          },
        });
      } catch (_error) {
        // Error handling is done in onError callback
        // Silent catch to prevent unhandled promise rejection
      }
    } else {
      setStep((prev) => Math.min(prev + 1, totalSteps));
    }
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormProvider {...methods}>
        <FormProgress
          currentStep={step}
          totalSteps={totalSteps}
          title="Edit Product"
        />
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {step === 1 && <ProductDetails editMode />}
          {step === 2 && <ProductPricing editMode />}
          {step === 3 && <ProductShipping editMode />}
          {step === 4 && <ProductInventory editMode />}
          {step === 5 && <ProductImages editMode />}
          {step === 6 && <ProductReview editMode />}

          {/* Reuse the same button component */}
          <FormControls
            editMode
            step={step}
            totalSteps={totalSteps}
            onPrev={() => {
              setStep((prev) => Math.max(prev - 1, 1));
            }}
          />
        </form>
      </FormProvider>
    </div>
  );
}
