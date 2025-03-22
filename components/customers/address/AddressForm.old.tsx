import { Event } from "@/app/lib/types/products.types";
import {
  addressTranslate,
  AddressType,
} from "@/public/locales/client/(auth)/account/addressTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { getCities } from "countries-cities";
import Input from "@/components/ui/Input";

type AddAddressComponentProps = {
  newAddress: Omit<AddressType, "_id">;
  onChange: (e: Event) => void;
  handleSubmitAddress: () => void;
  handleCancelAddAddress: () => void;
};
const AddAddressComponent = ({
  newAddress,
  onChange,
  handleSubmitAddress,
  handleCancelAddAddress,
}: AddAddressComponentProps) => {
  const ukraineCities = getCities("Ukraine");

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        {addressTranslate[lang].addAddress.title}
      </h3>
      <Input
        label={addressTranslate[lang].addAddress.form.street.label}
        name="street"
        type="text"
        value={newAddress.street}
        onChange={onChange}
        className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
        placeholder={addressTranslate[lang].addAddress.form.street.placeholder}
        icon
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Street
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.street.label}
          </label>
          <input
            name="street"
            type="text"
            value={newAddress.street}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder={
              addressTranslate[lang].addAddress.form.street.placeholder
            }
          />
        </div> */}

        {/* City */}
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.city.label}
          </label>
          <select
            name="city"
            value={newAddress.city}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
          >
            <option value="">
              {addressTranslate[lang].addAddress.form.city.option.select}
            </option>
            {ukraineCities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* State */}
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.state.label}
          </label>
          <input
            name="state"
            type="text"
            value={newAddress.state}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder={
              addressTranslate[lang].addAddress.form.state.placeholder
            }
          />
        </div>

        {/* Postal Code */}
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.postalCode.label}
          </label>
          <input
            name="postalCode"
            type="text"
            value={newAddress.postalCode}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder={
              addressTranslate[lang].addAddress.form.postalCode.placeholder
            }
          />
        </div>

        {/* Phone */}
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.phone.label}
          </label>
          <input
            name="phone"
            type="text"
            value={newAddress.phone}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder={
              addressTranslate[lang].addAddress.form.phone.placeholder
            }
          />
        </div>

        {/* Country (Read-Only) */}
        <div className="col-span-1">
          <label className="block text-gray-700">
            {addressTranslate[lang].addAddress.form.country.label}
          </label>
          <input
            name="country"
            type="text"
            value={"Ukraine"}
            readOnly
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder={
              addressTranslate[lang].addAddress.form.country.placeholder
            }
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* {handleCancelAddAddress && ( */}

        <button
          onClick={handleCancelAddAddress}
          className="mt-4 px-6 py-2 bg-red-500 text-white font-medium rounded hover:bg-red-600 transition duration-200"
        >
          {addressTranslate[lang].button.cancel}
        </button>
        <button
          onClick={handleSubmitAddress}
          className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition duration-200"
        >
          {addressTranslate[lang].button.saveAddress}
        </button>
      </div>
    </div>
  );
};

export default AddAddressComponent;
