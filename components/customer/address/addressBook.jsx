"use client";
import { useEffect, useState } from "react";
import { getCities } from "countries-cities"; // Importing to use Ukraine cities
import toast from "react-hot-toast";
import api from "../../util/axios.api";
import AddAddressComponent from "./addAddressReuseableComponent";

const AddressBook = () => {
  const [addresses, setAddresses] = useState([
    {
      street: "123 Main St",
      city: "Kyiv",
      state: "Kyiv Oblast",
      postalCode: "01001",
    },
    // You can add more existing addresses here
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  // Fetch cities of Ukraine for validation (or hardcode some if needed)
  const ukraineCities = getCities("Ukraine");
  //console.log(ukraineCities);

  const handleAddAddress = () => {
    // Ensure the city entered is in Ukraine
    if (!ukraineCities.includes(newAddress.city)) {
      alert("City must be in Ukraine");
      return;
    }

    setAddresses([...addresses, newAddress]);
    setNewAddress({ street: "", city: "", state: "", postalCode: "" });
    setShowForm(false);
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">My Address Book</h1>

      {/* List of existing addresses */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Saved Addresses</h2>
        <ul className="mt-4 space-y-2">
          {addresses.map((address, index) => (
            <li key={index} className="p-4 bg-white rounded shadow">
              <p>{address.street}</p>
              <p>
                {address.city}, {address.state}, {address.postalCode}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Button to toggle form for adding new address */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-200"
      >
        {showForm ? "Cancel" : "Add New Address"}
      </button>

      {/* Form to add new address (hidden by default) */}
      {showForm && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Add a New Address (Only in Ukraine)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street */}
            <div className="col-span-1">
              <label className="block text-gray-700">Street</label>
              <input
                type="text"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, street: e.target.value })
                }
                // className="mt-1 px-4 py-2 border rounded-lg w-full"
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter street"
              />
            </div>

            {/* City */}
            <div className="col-span-1">
              <label className="block text-gray-700">City</label>

              <select
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
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
                type="text"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                // className="mt-1 px-4 py-2 border rounded-lg w-full"
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter state"
              />
            </div>

            {/* Postal Code */}
            <div className="col-span-1">
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                value={newAddress.postalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
                // className="mt-1 px-4 py-2 border rounded-lg w-full"
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddAddress}
            className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition duration-200"
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  );
};

const AddressBookV2 = () => {
  const [addresses, setAddresses] = useState([
    {
      street: "123 Main St",
      city: "Kyiv",
      state: "Kyiv Oblast",
      postalCode: "01001",
    },
    // You can add more existing addresses here
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [isEditing, setIsEditing] = useState(null);
  const [editAddress, setEditAddress] = useState(null);

  const ukraineCities = getCities("Ukraine");

  const handleAddAddress = () => {
    if (!ukraineCities.includes(newAddress.city)) {
      alert("City must be in Ukraine");
      return;
    }

    setAddresses([...addresses, newAddress]);
    setNewAddress({ street: "", city: "", state: "", postalCode: "" });
    setShowForm(false);
  };

  const handleDeleteAddress = (index) => {
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleEditClick = (index) => {
    setIsEditing(index);

    setEditAddress({ ...addresses[index] });
  };

  const handleSaveEdit = (index) => {
    if (!ukraineCities.includes(editAddress.city)) {
      alert("City must be in Ukraine");
      return;
    }
    const updatedAddresses = [...addresses];
    updatedAddresses[index] = editAddress;
    setAddresses(updatedAddresses);
    setIsEditing(null);
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6">My Address Book</h1>

      {/* List of existing addresses */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Saved Addresses</h2>
        <ul className="mt-4 space-y-2">
          {addresses.map((address, index) => (
            <li key={index} className="p-4 bg-white rounded shadow">
              {isEditing === index ? (
                <div>
                  {/* Edit form for the specific address */}
                  <input
                    type="text"
                    value={editAddress.street}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        street: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="Street"
                  />
                  <select
                    value={editAddress.city}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                  >
                    <option value="">Select an Option</option>
                    {ukraineCities.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editAddress.state}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        state: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    value={editAddress.postalCode}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="Postal Code"
                  />
                  <button
                    onClick={() => handleSaveEdit(index)}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="px-4 py-2 ml-2 bg-red-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state}, {address.postalCode}
                  </p>
                  <button
                    onClick={() => handleEditClick(index)}
                    className="text-blue-500 mr-2"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(index)}
                    className="text-red-500"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Button to toggle form for adding new address */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-200"
      >
        {showForm ? "Cancel" : "Add New Address"}
      </button>

      {/* Form to add new address (hidden by default) */}
      {showForm && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            Add a New Address (Only in Ukraine)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Street */}
            <div className="col-span-1">
              <label className="block text-gray-700">Street</label>
              <input
                type="text"
                value={newAddress.street}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, street: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter street"
              />
            </div>

            {/* City */}
            <div className="col-span-1">
              <label className="block text-gray-700">City</label>
              <select
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
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
                type="text"
                value={newAddress.state}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, state: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter state"
              />
            </div>

            {/* Postal Code */}
            <div className="col-span-1">
              <label className="block text-gray-700">Postal Code</label>
              <input
                type="text"
                value={newAddress.postalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
                className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
                placeholder="Enter postal code"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleAddAddress}
            className="mt-4 px-6 py-2 bg-green-500 text-white font-medium rounded hover:bg-green-600 transition duration-200"
          >
            Save Address
          </button>
        </div>
      )}
    </div>
  );
};

const AddressBookV3 = ({ addressList }) => {
  const [addresses, setAddresses] = useState(addressList || []);

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    country: "Ukraine",
  });

  const [isEditing, setIsEditing] = useState(null);
  const [editAddress, setEditAddress] = useState(null);

  const ukraineCities = getCities("Ukraine");

  const handleAddAddress = async () => {
    let toastLoading;
    if (!ukraineCities.includes(newAddress.city)) {
      toast.error("City must be in Ukraine");
      return;
    }
    // //console.log("newAddress", newAddress);
    if (
      !newAddress.city ||
      !newAddress.street ||
      !newAddress.state ||
      !newAddress.postalCode ||
      !newAddress.phone
    ) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      toastLoading = toast.loading("Adding Address...");
      await api.post("/customer/address", newAddress);

      toast.success("Address Added Successfully!");
      setAddresses([...addresses, newAddress]);
      setNewAddress({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        phone: "",
        country: "Ukraine",
      });
      setShowForm(false);
    } catch (error) {
      toast.error(error?.message || error || "Failed to add address");
    } finally {
      toast.dismiss(toastLoading);
    }

    // setAddresses([...addresses, newAddress]);
  };

  const handleDeleteAddress = async (id) => {
    let toastLoading;

    try {
      toastLoading = toast.loading("Deleting Address...");
      await api.delete(`/customer/address/${id}`);
      toast.success("Address Deleted Successfully!");
      setAddresses(addresses.filter((address) => address._id !== id));
    } catch (error) {
      toast.error(error?.message || error || "Failed to delete address");
    } finally {
      toast.dismiss(toastLoading);
    }
    // setAddresses(addresses.filter((_, i) => i !== index));
  };

  const handleEditClick = (id) => {
    setIsEditing(id);
    const findAddress = addresses.find((address) => address._id === id);

    setEditAddress(findAddress);
  };

  const handleSaveEdit = async (id) => {
    let toastLoading;
    // if (!ukraineCities.includes(editAddress.city)) {
    //   toast.error("City must be in Ukraine");
    //   return;
    // }
    if (
      !editAddress.city ||
      !editAddress.street ||
      !editAddress.state ||
      !editAddress.postalCode ||
      !editAddress.phone
    ) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      toastLoading = toast.loading("Updating Address...");
      await api.patch(`/customer/address/${id}`, editAddress);
      toast.success("Address Updated Successfully!");
      setAddresses((prev) =>
        prev.map((address) => (address._id === id ? editAddress : address))
      );
      setIsEditing(null);
    } catch (error) {
      toast.error(error?.message || error || "Failed to update address");
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    //console.log("name", name);
    //console.log("value", value);
    setNewAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };
  const handelCancelAddAddress = () => {
    setShowForm(false);
    setNewAddress({
      street: "",
      city: "",
      state: "",
      postalCode: "",
      phone: "",
      country: "Ukraine",
    });
  };
  useEffect(() => {
    setAddresses(addressList);
  }, [addressList]);
  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg min-h-screen overflow-hidden">
      <h1 className="text-3xl font-bold mb-6">My Address Book</h1>
      {/* List of existing addresses */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Saved Addresses</h2>
        <ul className="mt-4 space-y-2 max-h-[90vh] md:max-h-[60vh] overflow-y-auto">
          {addresses.map((address, index) => (
            <li key={address._id} className="p-4 bg-white rounded shadow">
              {isEditing === address._id ? (
                <div>
                  {/* Edit form for the specific address */}
                  <input
                    type="text"
                    value={editAddress.street}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        street: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="Street"
                  />
                  <select
                    value={editAddress.city}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                  >
                    <option value="">Select an Option</option>
                    {ukraineCities.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={editAddress.state}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        state: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="State"
                  />
                  <input
                    type="text"
                    value={editAddress.postalCode}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        postalCode: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="Postal Code"
                  />
                  <input
                    type="text"
                    value={editAddress.phone}
                    onChange={(e) =>
                      setEditAddress({
                        ...editAddress,
                        phone: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                    placeholder="Phone Number"
                  />
                  <input
                    type="text"
                    value="Ukraine"
                    readOnly
                    className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
                  />

                  <button
                    onClick={() => handleSaveEdit(editAddress._id)}
                    className="px-4 py-2 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditing(null)}
                    className="px-4 py-2 ml-2 bg-red-500 text-white rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <p>{address.street}</p>
                  <p>
                    {address.city}, {address.state}, {address.postalCode}
                  </p>
                  <p>Phone: {address.phone}</p>
                  <p>Country: {address.country}</p>
                  <button
                    onClick={() => handleEditClick(address._id)}
                    className="text-blue-500 mr-2"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address._id)}
                    className="text-red-500"
                  >
                    🗑️ Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Button to toggle form for adding new address */}
      {!showForm && (
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-200"
        >
          Add New Address
        </button>
      )}
      {/* Form to add new address (hidden by default) */}
      {showForm && (
        <AddAddressComponent
          newAddress={newAddress}
          handleAddAddress={handleAddAddress}
          onChange={handleInputChange}
          handleCancelAddAddress={handelCancelAddAddress}
        />
      )}
    </div>
  );
};
export default AddressBookV3;
