// add-product.tsx (main form component)
"use client";
import { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ProductDetails from "./product-details";
import ProductShipping from "./product-shipping";
import FormProgress from "./form-progress";
import ProductImages from "./product-images";
import ProductReview from "./product-review";
import ProductPricing from "./product-pricing";
import ProductInventory from "./product-inventory";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { ProductType } from "@/app/lib/types/products.types";
import toast from "react-hot-toast";
import api from "@/app/lib/utilities/api";
export type PreviewFile = string;
// export type PreviewFile = File & { preview: string };
interface FormData
  extends Omit<
    ProductType,
    "_id" | "slug" | "ratingsAverage" | "ratingsQuantity" | "active" | "images"
  > {
  images: PreviewFile[];
}

export default function AddProduct() {
  const methods = useForm<FormData>({
    defaultValues: {
      shippingInfo: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
      },
      attributes: {},
      reserved: 0,
      sold: 0,
    },
  });

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const saveDraft = () => {
    const formData = methods.getValues();
    localStorage.setItem("productDraft", JSON.stringify(formData));
    toast.success(productsTranslate.products[lang].draftSaved);
  };

  // Update form submission handler
  const onSubmit = async (data: FormData) => {
    if (step === totalSteps) {
      let toastLoading;

      try {
        toastLoading = toast.loading(
          productsTranslate.products[lang].addProduct.form.productSubmit.loading
        );
        await api.post("/admin/dashboard/products/", data);
        toast.success(
          productsTranslate.products[lang].addProduct.form.productSubmit.success
        );
        localStorage.removeItem("productDraft");
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
      nextStep();
    }
  };
  useEffect(() => {
    const draft = localStorage.getItem("productDraft");
    if (draft) {
      methods.reset(JSON.parse(draft));
    }
  }, [methods]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <FormProvider {...methods}>
        <FormProgress currentStep={step} totalSteps={totalSteps} />

        <form
          onSubmit={methods.handleSubmit(onSubmit)}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          {step === 1 && <ProductDetails />}
          {step === 2 && <ProductPricing />}
          {step === 3 && <ProductShipping />}
          {step === 4 && <ProductInventory />}
          {step === 5 && <ProductImages />}
          {step === 6 && <ProductReview />}

          <div className="mt-8 flex justify-between gap-4">
            {step > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="btn-secondary flex-1"
              >
                {
                  productsTranslate.products[lang].addProduct.form.button
                    .previous
                }
              </button>
            )}

            {step < totalSteps ? (
              <>
                <button
                  type="button"
                  onClick={saveDraft}
                  className="btn-gray flex-1"
                >
                  {
                    productsTranslate.products[lang].addProduct.form.button
                      .saveDraft
                  }
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {productsTranslate.products[lang].addProduct.form.button.next}
                </button>
              </>
            ) : (
              <button type="submit" className="btn-success flex-1">
                {productsTranslate.products[lang].addProduct.form.button.submit}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
