// add-product.tsx (main form component)
"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";

import type { ProductType } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

import FormProgress from "./form-progress";
import ProductDetails from "./product-details";
import ProductImages from "./product-images";
import ProductInventory from "./product-inventory";
import ProductPricing from "./product-pricing";
import ProductReview from "./product-review";
import ProductShipping from "./product-shipping";

// GraphQL Mutation
const CREATE_PRODUCT = gql`
  mutation CreateProduct($product: ProductInput!) {
    createProduct(product: $product) {
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
      created_at
      updated_at
    }
  }
`;

// GraphQL response type
interface CreateProductResponse {
  createProduct: ProductType;
}

// add-product.tsx (main form component)

export type PreviewFile = string;
// export type PreviewFile = File & { preview: string };
export interface FormData
  extends Omit<
    ProductType,
    | "_id"
    | "slug"
    | "ratings_average"
    | "ratings_quantity"
    | "active"
    | "images"
  > {
  images: PreviewFile[];
}

export default function AddProduct() {
  const router = useRouter();
  const methods = useForm<FormData>({
    defaultValues: {
      shipping_info: {
        weight: 0,
        dimensions: { length: 0, width: 0, height: 0 },
      },
      // // attributes: {},
      // reserved: 0,
      // sold: 0,
    },
  });

  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // GraphQL Mutation
  const [createProduct, { loading: isSubmitting }] =
    useMutation<CreateProductResponse>(CREATE_PRODUCT, {
      onCompleted: (data) => {
        if (data?.createProduct) {
          toast.success(
            productsTranslate.products[lang].addProduct.form.productSubmit
              .success
          );
          localStorage.removeItem("productDraft");
          router.push(`/dashboard/products/${data.createProduct.slug}`);
        }
      },
      onError: (error) => {
        toast.error(
          error.message || productsTranslate.products[lang].error.general
        );
      },
    });

  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const saveDraft = () => {
    const formData = methods.getValues();
    localStorage.setItem("productDraft", JSON.stringify(formData));
    toast.success(productsTranslate.products[lang].draftSaved);
  };

  // Update form submission handler
  const onSubmit = async (data: FormData) => {
    if (step === totalSteps) {
      // Prepare mutation input to match ProductInput schema
      const productInput = {
        name: data.name,
        category: data.category,
        price: data.price,
        discount: data.discount || 0,
        discount_expire: data.discount_expire || null,
        description: data.description,
        stock: data.stock,
        sku: data.sku || "",
        images: data.images, // Array of image URLs
        shipping_info: {
          weight: data.shipping_info.weight,
          dimensions: {
            length: data.shipping_info.dimensions.length,
            width: data.shipping_info.dimensions.width,
            height: data.shipping_info.dimensions.height,
          },
        },
        reserved: 0, // Default values for inventory tracking
        sold: 0,
      };

      // Execute GraphQL mutation
      await createProduct({
        variables: {
          product: productInput,
        },
      });
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
              <button
                type="submit"
                className="btn-success flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? productsTranslate.products[lang].addProduct.form
                      .productSubmit.loading
                  : productsTranslate.products[lang].addProduct.form.button
                      .submit}
              </button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
