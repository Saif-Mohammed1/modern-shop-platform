// components/FormControls.tsx
"use client";

import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/utilities/lang";
import Button from "@/components/ui/Button";

interface FormControlsProps {
  step: number;
  totalSteps: number;
  onPrev: () => void;
  editMode?: boolean;
  onDelete?: () => void;
}

export default function FormControls({
  step,
  totalSteps,
  onPrev,
  editMode = false,
  onDelete,
}: FormControlsProps) {
  return (
    <div className="mt-8 flex justify-between gap-4">
      {/* Left side controls */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="flex-1"
          >
            {productsTranslate.products[lang].addProduct.form.button.previous}
          </Button>
        )}

        {editMode && onDelete && step === 1 && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            className="flex-1"
          >
            Delete Product
          </Button>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex gap-4">
        {step < totalSteps ? (
          <>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                /* Add save draft logic */
              }}
              className="flex-1"
            >
              {
                productsTranslate.products[lang].addProduct.form.button
                  .saveDraft
              }
            </Button>
            <Button type="submit" className="flex-1">
              {productsTranslate.products[lang].addProduct.form.button.next}
            </Button>
          </>
        ) : (
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {editMode
              ? "Update Product"
              : productsTranslate.products[lang].addProduct.form.button.submit}
          </Button>
        )}
      </div>
    </div>
  );
}
