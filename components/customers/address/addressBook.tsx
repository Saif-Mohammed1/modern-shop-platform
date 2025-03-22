"use client";
import { lang } from "@/app/lib/utilities/lang";
import {
  addressTranslate,
  AddressType,
} from "@/public/locales/client/(auth)/account/addressTranslate";
import AddressForm, { AddressFormValues } from "./AddressForm";
import { useState } from "react";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import Spinner from "@/components/spinner/spinner";
type AddressBookProps = {
  initialAddresses: AddressType[];
  hasNextPage: boolean;
};
// Main Address Book Component
const AddressBook = ({ initialAddresses, hasNextPage }: AddressBookProps) => {
  const [addresses, setAddresses] = useState<AddressType[]>(initialAddresses);
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editAddress, setEditAddress] = useState<AddressType | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(hasNextPage);

  const loadMoreAddresses = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { data } = await api.get(`/customers/address?page=${nextPage}`);
      setAddresses((prev) => [...prev, ...data.docs]);
      setPage(nextPage);
      setHasMore(data.meta.hasNextPage);
    } catch (error) {
      toast.error(
        (error as Error).message || addressTranslate[lang].error.global
      );
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFormSubmit = async (data: AddressFormValues) => {
    try {
      if (isEditing && editAddress) {
        const { data: updatedAddress } = await api.patch(
          `/customers/address/${editAddress._id}`,
          data
        );
        setAddresses((prev) =>
          prev.map((addr) =>
            addr._id === editAddress._id ? updatedAddress : addr
          )
        );
        toast.success(addressTranslate[lang].function.handleSaveEdit.success);
      } else {
        const { data: newAddress } = await api.post("/customers/address", data);
        setAddresses((prev) => [newAddress, ...prev]);
        toast.success(addressTranslate[lang].function.handleAddAddress.success);
      }
      setShowForm(false);
      setIsEditing(null);
    } catch (error) {
      toast.error(
        (error as Error).message || addressTranslate[lang].error.global
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/customers/address/${id}`);
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      toast.success(
        addressTranslate[lang].function.handleDeleteAddress.success
      );
    } catch (error) {
      toast.error(
        (error as Error).message || addressTranslate[lang].error.global
      );
    }
  };

  return (
    <div className="container mx-auto mt-8 p-6 bg-gray-100 rounded-lg shadow-lg min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        {addressTranslate[lang].title.main}
      </h1>

      <div className="mb-8">
        {!showForm && !isEditing && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {addressTranslate[lang].button.addNewAddress}
          </button>
        )}

        {(showForm || isEditing) && (
          <AddressForm
            defaultValues={editAddress ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setIsEditing(null);
            }}
            isEditing={!!isEditing}
          />
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {addressTranslate[lang].title.subTitle}
        </h2>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {addresses.map((address) => (
            <div key={address._id} className="p-4 bg-white rounded shadow">
              {isEditing === address._id ? (
                <AddressForm
                  defaultValues={address}
                  onSubmit={handleFormSubmit}
                  onCancel={() => setIsEditing(null)}
                  isEditing
                />
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="font-medium">{address.street}</p>
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>
                      {addressTranslate[lang].addAddress.form.phone.label}:{" "}
                      {address.phone}
                    </p>
                    <p>
                      {addressTranslate[lang].addAddress.form.country.label}:{" "}
                      {address.country}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => {
                        setIsEditing(address._id);
                        setEditAddress(address);
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      {addressTranslate[lang].button.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(address._id)}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      {addressTranslate[lang].button.delete}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={loadMoreAddresses}
            disabled={loadingMore}
            className="mt-4 px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            {loadingMore ? <Spinner /> : addressTranslate[lang].button.loadMore}
          </button>
        )}
      </div>
    </div>
  );
};

export default AddressBook;
