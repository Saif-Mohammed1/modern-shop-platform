"use client";
import { useState } from "react";
import { getCities } from "countries-cities"; // Importing to use Ukraine cities
import toast from "react-hot-toast";
import api from "../../../app/lib/utilities/api";
import dynamic from "next/dynamic";
import {
  addressTranslate,
  AddressType,
} from "@/public/locales/client/(auth)/account/addressTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { Event } from "@/app/lib/types/products.types";
import CustomButton from "@/components/button/button";
import { AddressFormValues } from "./AddressForm";
// import { useRouter } from "next/navigation";
const AddressForm = dynamic(() => import("./AddressForm"));

type AddressBookProps = {
  addressList: AddressType[];
  hasNextPage: boolean;
};

const AddressBook = ({ addressList, hasNextPage }: AddressBookProps) => {
  const [moreResults, setMoreResults] = useState<AddressType[]>(
    addressList || []
  );
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showMore, setShowMore] = useState(hasNextPage);

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<AddressType, "_id">>({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
    country: "Ukraine",
  });

  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState<AddressType | null>(null);

  const ukraineCities = getCities("Ukraine");
  // const router = useRouter();

  const getMoreResults = async () => {
    try {
      setLoading(true);
      const newPage = page + 1;
      setPage((prevPage) => prevPage++);
      const { data } = await api.get(`/customers/address/?page=${newPage}`);
      setMoreResults([...moreResults, ...data.docs]);
      setPage(newPage);
      setShowMore(data.meta.hasNext);
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };
  // const handleAddAddress = async () => {
  //   let toastLoading;

  //   if (!ukraineCities.includes(newAddress.city ?? "")) {
  //     toast.error(
  //       addressTranslate[lang].function.handleAddAddress.cityMustBeInUkraine
  //     );
  //     return;
  //   }
  //   if (
  //     !newAddress.city ||
  //     !newAddress.street ||
  //     !newAddress.state ||
  //     !newAddress.postalCode ||
  //     !newAddress.phone
  //   ) {
  //     toast.error(addressTranslate[lang].error.emptyField);
  //     return;
  //   }
  //   try {
  //     toastLoading = toast.loading(
  //       addressTranslate[lang].function.handleAddAddress.loading
  //     );
  //     const { data } = await api.post("/customers/address", newAddress);
  //     toast.success(addressTranslate[lang].function.handleAddAddress.success);
  //     setMoreResults([data, ...moreResults]);
  //     // router.refresh();
  //     setNewAddress({
  //       street: "",
  //       city: "",
  //       state: "",
  //       postalCode: "",
  //       phone: "",
  //       country: "Ukraine",
  //     });
  //     setShowForm(false);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(error?.message || addressTranslate[lang].error.global);
  //     } else {
  //       toast.error(addressTranslate[lang].error.global);
  //     }
  //   } finally {
  //     toast.dismiss(toastLoading);
  //   }

  //   // setMoreResults([...moreResults, newAddress]);
  // };

  const handleFormSubmit = async (data: AddressFormValues) => {
    try {
      if (isEditing && editAddress) {
        await api.patch(`/customers/address/${editAddress._id}`, data);
        setMoreResults((prev) =>
          prev.map((a) => (a._id === editAddress._id ? { ...a, ...data } : a))
        );
      } else {
        const { data: newAddress } = await api.post("/customers/address", data);
        setMoreResults((prev) => [newAddress, ...prev]);
      }
      setShowForm(false);
      setIsEditing(null);
    } catch (error) {
      toast.error(
        (error as Error)?.message || addressTranslate[lang].error.global
      );
      // Handle error
    }
  };
  const handleDeleteAddress = async (id: string) => {
    let toastLoading;

    try {
      toastLoading = toast.loading(
        addressTranslate[lang].function.handleDeleteAddress.loading
      );
      await api.delete(`/customers/address/${id}`);
      toast.success(
        addressTranslate[lang].function.handleDeleteAddress.success
      );
      setMoreResults(moreResults.filter((address) => address._id !== id));
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error?.message || addressTranslate[lang].error.global);
      } else {
        toast.error(addressTranslate[lang].error.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
    // setMoreResults(moreResults.filter((_, i) => i !== index));
  };

  const handleEditClick = (id: string) => {
    setIsEditing(id);
    const findAddress =
      moreResults.find((address) => address._id === id) || null;

    setEditAddress(findAddress);
  };

  const handleSaveEdit = async (id: string) => {
    let toastLoading;
    if (!editAddress) {
      return;
    }
    if (!ukraineCities.includes(editAddress?.city)) {
      toast.error(
        addressTranslate[lang].function.handleAddAddress.cityMustBeInUkraine
      );
      return;
    }
    if (
      !editAddress?.city ||
      !editAddress?.street ||
      !editAddress?.state ||
      !editAddress?.postalCode ||
      !editAddress?.phone
    ) {
      toast.error(addressTranslate[lang].error.emptyField);
      return;
    }
    try {
      toastLoading = toast.loading(
        addressTranslate[lang].function.handleSaveEdit.loading
      );
      await api.patch(`/customers/address/${id}`, editAddress);
      toast.success(addressTranslate[lang].function.handleSaveEdit.success);
      setMoreResults((prev) =>
        prev.map((address) => (address._id === id ? editAddress : address))
      );
      setIsEditing(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error?.message || addressTranslate[lang].error.global);
      } else {
        toast.error(addressTranslate[lang].error.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  const handleInputChange = (e: Event) => {
    const { name, value } = e.target;

    setNewAddress((prevAddress) => ({ ...prevAddress, [name]: value }));
  };
  const handleIsEditInputChange = (e: Event) => {
    const { name, value } = e.target;

    setEditAddress((prevAddress) => {
      if (prevAddress) {
        return { ...prevAddress, [name]: value };
      }
      return prevAddress;
    });
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

  // return (
  //   <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg min-h-screen overflow-hidden">
  //     <h1 className="text-3xl font-bold mb-6">
  //       {addressTranslate[lang].title.main}
  //     </h1>
  //     {/* List of existing moreResults */}
  //     <div className="mb-4">
  //       <h2 className="text-2xl font-semibold">
  //         {" "}
  //         {addressTranslate[lang].title.subTitle}
  //       </h2>
  //       <ul className="mt-4 space-y-2 max-h-[90vh] md:max-h-[60vh] overflow-y-auto">
  //         {moreResults.map((address) => (
  //           <li key={address._id} className="p-4 bg-white rounded shadow">
  //             {editAddress && isEditing === address._id ? (
  //               // <div>
  //               //   {/* Edit form for the specific address */}
  //               //   <input
  //               //     name="street"
  //               //     type="text"
  //               //     value={editAddress?.street}
  //               //     onChange={handleIsEditInputChange}
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //     placeholder={
  //               //       addressTranslate[lang].addAddress.form.street.placeholder
  //               //     }
  //               //   />
  //               //   <select
  //               //     name="city"
  //               //     value={editAddress?.city}
  //               //     onChange={handleIsEditInputChange}
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //   >
  //               //     <option value="">
  //               //       {
  //               //         addressTranslate[lang].addAddress.form.city.option
  //               //           .select
  //               //       }
  //               //     </option>
  //               //     {ukraineCities.map((option) => (
  //               //       <option key={option} value={option}>
  //               //         {option}
  //               //       </option>
  //               //     ))}
  //               //   </select>
  //               //   <input
  //               //     name="state"
  //               //     type="text"
  //               //     value={editAddress?.state}
  //               //     onChange={handleIsEditInputChange}
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //     placeholder={
  //               //       addressTranslate[lang].addAddress.form.state.placeholder
  //               //     }
  //               //   />
  //               //   <input
  //               //     name="postalCode"
  //               //     type="text"
  //               //     value={editAddress?.postalCode}
  //               //     onChange={handleIsEditInputChange}
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //     placeholder={
  //               //       addressTranslate[lang].addAddress.form.postalCode
  //               //         .placeholder
  //               //     }
  //               //   />
  //               //   <input
  //               //     type="text"
  //               //     name="phone"
  //               //     value={editAddress?.phone}
  //               //     onChange={handleIsEditInputChange}
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //     placeholder={
  //               //       addressTranslate[lang].addAddress.form.phone.placeholder
  //               //     }
  //               //   />
  //               //   <input
  //               //     name="country"
  //               //     type="text"
  //               //     value="Ukraine"
  //               //     readOnly
  //               //     className="w-full p-2 border rounded-lg bg-gray-50 mb-2"
  //               //   />

  //               //   <button
  //               //     onClick={() => handleSaveEdit(editAddress?._id as string)}
  //               //     className="px-4 py-2 bg-green-500 text-white rounded"
  //               //   >
  //               //     {addressTranslate[lang].button.save}
  //               //   </button>
  //               //   <button
  //               //     onClick={() => setIsEditing(null)}
  //               //     className="px-4 py-2 ml-2 bg-red-500 text-white rounded"
  //               //   >
  //               //     {addressTranslate[lang].button.cancel}
  //               //   </button>
  //               // </div>
  //               <AddressForm
  //                 newAddress={editAddress}
  //                 handleSubmitAddress={handleSaveEdit}
  //                 onChange={handleIsEditInputChange}
  //                 handleCancelAddAddress={() => setIsEditing(null)}
  //               />
  //             ) : (
  //               <div>
  //                 <p>{address.street}</p>
  //                 <p>
  //                   {address.city}, {address.state}, {address.postalCode}
  //                 </p>
  //                 <p>
  //                   {addressTranslate[lang].addAddress.form.phone.label}:{" "}
  //                   {address.phone}
  //                 </p>
  //                 <p>
  //                   {addressTranslate[lang].addAddress.form.country.label}:{" "}
  //                   {address.country}
  //                 </p>
  //                 <button
  //                   onClick={() => handleEditClick(address?._id)}
  //                   className="text-blue-500 mr-2"
  //                 >
  //                   ✏️ {addressTranslate[lang].button.edit}
  //                 </button>
  //                 <button
  //                   onClick={() => handleDeleteAddress(address?._id)}
  //                   className="text-red-500"
  //                 >
  //                   🗑️ {addressTranslate[lang].button.delete}
  //                 </button>
  //               </div>
  //             )}
  //           </li>
  //         ))}
  //       </ul>
  //     </div>
  //     {/* Button to toggle form for adding new address */}
  //     {!showForm && (
  //       <div className="flex items-center justify-between my-4">
  //         <button
  //           onClick={() => setShowForm(!showForm)}
  //           className="px-6 py-2 bg-blue-500 text-white font-medium rounded hover:bg-blue-600 transition duration-200"
  //         >
  //           {addressTranslate[lang].button.addNewAddress}
  //         </button>
  //         {/* Button to show more results */}
  //         <CustomButton
  //           showMore={showMore}
  //           getMoreResults={getMoreResults}
  //           loading={loading}
  //         />
  //       </div>
  //     )}

  //     {/* Form to add new address (hidden by default) */}
  //     {showForm && (
  //       <AddressForm
  //         newAddress={newAddress}
  //         handleSubmitAddress={handleAddAddress}
  //         onChange={handleInputChange}
  //         handleCancelAddAddress={handelCancelAddAddress}
  //       />
  //     )}
  //   </div>
  // );
};
export default AddressBook;
