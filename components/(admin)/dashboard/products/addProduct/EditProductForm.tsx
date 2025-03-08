// components/products/EditProductForm.tsx
"use client";

import { ProductType } from "@/app/lib/types/products.types";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormProgress from "./form-progress";
import ProductDetails from "./product-details";
import ProductPricing from "./product-pricing";
import ProductShipping from "./product-shipping";
import ProductInventory from "./product-inventory";
import ProductImages from "./product-images";
import ProductReview from "./product-review";
import FormControls from "./FormControls";

interface EditProductFormProps {
  defaultValues: ProductType;
}

export default function EditProductForm({
  defaultValues,
}: EditProductFormProps) {
  const methods = useForm<ProductType>({ defaultValues });
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const handleSubmit = methods.handleSubmit((data) => {
    if (step === totalSteps) {
      if (data.images) {
        data.images = data.images.filter((img) => !(typeof img === "object"));
      }
      console.log(data);
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
            onPrev={() => setStep((prev) => Math.max(prev - 1, 1))}
          />
        </form>{" "}
      </FormProvider>
    </div>
  );
}
