import { getCities } from "countries-cities";

const AddAddressComponent = ({
  newAddress,
  onChange,
  handleAddAddress,
  handleCancelAddAddress,
}) => {
  const ukraineCities = getCities("Ukraine");

  return (
    <div className="mt-6 p-6 bg-white rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        Add a New Address (Only in Ukraine)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Street */}
        <div className="col-span-1">
          <label className="block text-gray-700">Street</label>
          <input
            name="street"
            type="text"
            value={newAddress.street}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder="Enter street"
          />
        </div>

        {/* City */}
        <div className="col-span-1">
          <label className="block text-gray-700">City</label>
          <select
            name="city"
            value={newAddress.city}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
          >
            <option value="">Select an Option</option>
            {ukraineCities.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {/* State */}
        <div className="col-span-1">
          <label className="block text-gray-700">State</label>
          <input
            name="state"
            type="text"
            value={newAddress.state}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder="Enter state"
          />
        </div>

        {/* Postal Code */}
        <div className="col-span-1">
          <label className="block text-gray-700">Postal Code</label>
          <input
            name="postalCode"
            type="text"
            value={newAddress.postalCode}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder="Enter postal code"
          />
        </div>

        {/* Phone */}
        <div className="col-span-1">
          <label className="block text-gray-700">Phone Number</label>
          <input
            name="phone"
            type="text"
            value={newAddress.phone}
            onChange={onChange}
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder="Enter phone number"
          />
        </div>

        {/* Country (Read-Only) */}
        <div className="col-span-1">
          <label className="block text-gray-700">Country</label>
          <input
            name="country"
            type="text"
            value={"Ukraine"}
            readOnly
            className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
            placeholder="Enter Country Name"
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
          Cancel{" "}
        </button>
        <button
          onClick={handleAddAddress}
          className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition duration-200"
        >
          Save Address
        </button>
      </div>
    </div>
  );
};

export default AddAddressComponent;
