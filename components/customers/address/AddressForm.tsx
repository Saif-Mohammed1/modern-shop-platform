// AddressForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getCities } from "countries-cities";
import Input from "@/components/ui/Input";
import { addressTranslate } from "@/public/locales/client/(auth)/account/addressTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { AddressTranslate } from "@/public/locales/server/Address.Translate";
import Spinner from "@/components/spinner/spinner";
import type { AddressType } from "@/app/lib/types/address.types";

const ukraineCities = getCities("Ukraine");

// const addressSchema = z.object({
//   street: z.string().min(1, AddressTranslate[lang].street.required),
//   city: z.string().min(1, AddressTranslate[lang].city.required),
//   state: z.string().min(1, AddressTranslate[lang].state.required),
//   postalCode: z.string().min(1, AddressTranslate[lang].postalCode.required),
//   phone: z.string().regex(/^\+380\d{9}$/, AddressTranslate[lang].phone.invalid),
//   country: z.literal("Ukraine"),
// });
const addressSchema = z.object({
  street: z
    .string({ required_error: AddressTranslate[lang].street.required })
    .trim()
    .min(1, AddressTranslate[lang].street.required),
  city: z
    .string({
      required_error: AddressTranslate[lang].city.required,
    })
    .trim()
    .min(1, AddressTranslate[lang].city.required),
  state: z
    .string({
      required_error: AddressTranslate[lang].state.required,
    })
    .trim()
    .min(1, AddressTranslate[lang].state.required),
  postalCode: z
    .string({
      required_error: AddressTranslate[lang].postalCode.required,
    })
    .trim()
    .min(1, AddressTranslate[lang].postalCode.required),
  phone: z
    .string({
      required_error: AddressTranslate[lang].phone.required,
    })
    .regex(/^\+380\d{9}$/, AddressTranslate[lang].phone.invalid),
  country: z
    .string({
      required_error: AddressTranslate[lang].country.required,
    })
    .trim()
    .min(1, AddressTranslate[lang].country.required),
});
export type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  defaultValues?: Partial<AddressType>;
  onSubmit: (data: AddressFormValues) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

const AddressForm = ({
  defaultValues,
  onSubmit,
  onCancel,
  isEditing = false,
}: AddressFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: "Ukraine",
      ...defaultValues,
    },
    mode: "onBlur",
  });
  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        {isEditing
          ? addressTranslate[lang].editAddress.title
          : addressTranslate[lang].addAddress.title}
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label={addressTranslate[lang].addAddress.form.street.label}
          {...register("street")}
          error={errors.street?.message}
          placeholder={
            addressTranslate[lang].addAddress.form.street.placeholder
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-gray-700">
              {addressTranslate[lang].addAddress.form.city.label}
            </label>
            <select
              {...register("city")}
              className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            >
              <option value="">
                {addressTranslate[lang].addAddress.form.city.option.select}
              </option>
              {ukraineCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <Input
            label={addressTranslate[lang].addAddress.form.state.label}
            {...register("state")}
            error={errors.state?.message}
            placeholder={
              addressTranslate[lang].addAddress.form.state.placeholder
            }
          />

          <Input
            label={addressTranslate[lang].addAddress.form.postalCode.label}
            {...register("postalCode")}
            error={errors.postalCode?.message}
            placeholder={
              addressTranslate[lang].addAddress.form.postalCode.placeholder
            }
          />

          <Input
            label={addressTranslate[lang].addAddress.form.phone.label}
            {...register("phone")}
            error={errors.phone?.message}
            placeholder={
              addressTranslate[lang].addAddress.form.phone.placeholder
            }
          />

          <Input
            label={addressTranslate[lang].addAddress.form.country.label}
            {...register("country")}
            readOnly
            disabled
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            {addressTranslate[lang].button.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Spinner />
            ) : (
              addressTranslate[lang].button.saveAddress
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;
