"use client";
import { useEffect, useState } from "react";
import { getCities } from "countries-cities"; // Importing to use Ukraine cities
import toast from "react-hot-toast";
import api from "../../util/axios.api";
import dynamic from "next/dynamic";
const AddAddressComponent = dynamic(() =>
  import("./addAddressReuseableComponent")
);

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
