// components/products/EditProductForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import type { ProductType } from "@/app/lib/types/products.types";
import api from "@/app/lib/utilities/api";
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

// components/products/EditProductForm.tsx

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
  const handleSubmit = methods.handleSubmit(async (data) => {
    let toastLoading;
    if (step === totalSteps) {
      if (data.images) {
        data.images = data.images.filter((img) => !(typeof img === "object"));
      }
      try {
        toastLoading = toast.loading(
          productsTranslate.products[lang].editProduct.form.productSubmit
            .loading
        );
        await api.put(`/admin/dashboard/products/${defaultValues.slug}`, data);
        toast.success(
          productsTranslate.products[lang].editProduct.form.productSubmit
            .success
        );
        router.push(`/dashboard/products?search=${defaultValues.name}`);
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
        </form>{" "}
      </FormProvider>
    </div>
  );
}
