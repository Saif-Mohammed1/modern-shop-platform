"use client";

import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";

import type { AddressType } from "@/app/lib/types/address.db.types";
import { lang } from "@/app/lib/utilities/lang";
import { addressTranslate } from "@/public/locales/client/(auth)/account/addressTranslate";

import AddressForm, { type AddressFormValues } from "./AddressForm";

type AddressBookProps = {
  initialAddresses: AddressType[];
  hasNextPage: boolean;
  totalAddresses: number;
};

// GraphQL Mutation Response Types
type CreateAddressMutationResponse = {
  addAddress: AddressType;
};

type UpdateAddressMutationResponse = {
  updateMyAddress: AddressType;
};

type DeleteAddressMutationResponse = {
  deleteMyAddress: {
    message: string;
  };
};

// GraphQL Mutation Variables Types
type CreateAddressMutationVariables = {
  request: {
    phone: string;
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
};

type UpdateAddressMutationVariables = {
  id: string;
  request: {
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
};

type DeleteAddressMutationVariables = {
  id: string;
};

// Main Address Book Component

const GET_ADDRESSES_QUERY = gql`
  query ($filter: Filter) {
    getMyAddress(filter: $filter) {
      docs {
        _id
        phone
        user_id
        street
        city
        state
        postal_code
        country
      }

      meta {
        hasNext
        total
      }
    }
  }
`;

const CREATE_ADDRESS_MUTATION = gql`
  mutation ($request: CreateAddressInput!) {
    addAddress(input: $request) {
      _id
      phone
      user_id
      street
      city
      state
      postal_code
      country
    }
  }
`;
const UPDATE_ADDRESS_MUTATION = gql`
  mutation ($id: String!, $request: UpdateAddressInput!) {
    updateMyAddress(id: $id, input: $request) {
      _id
      phone
      user_id
      street
      city
      state
      postal_code
      country
    }
  }
`;
const DELETE_ADDRESS_MUTATION = gql`
  mutation ($id: String!) {
    deleteMyAddress(id: $id) {
      message
    }
  }
`;
// const AddressBook = () => {
const AddressBook = ({
  initialAddresses,
  hasNextPage,
  totalAddresses,
}: AddressBookProps) => {
  const [addresses, setAddresses] = useState<AddressType[]>(
    initialAddresses || []
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<AddressType | null>(
    null
  );
  const [hasMore, setHasMore] = useState<boolean>(hasNextPage);
  const [totalCount, setTotalCount] = useState<number>(totalAddresses);

  const [getMoreAddresses, { loading: loadingMore }] = useLazyQuery<{
    getMyAddress: {
      docs: AddressType[];
      meta: {
        hasNext: boolean;
        total: number;
      };
    };
  }>(GET_ADDRESSES_QUERY, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      setAddresses((prev) => [...prev, ...data.getMyAddress.docs]);
      setHasMore(data.getMyAddress.meta.hasNext);
      setTotalCount(data.getMyAddress.meta.total);
    },
    onError: (error) => {
      toast.error(error.message || addressTranslate[lang].error.global);
    },
  });
  const [createAddress] = useMutation<
    CreateAddressMutationResponse,
    CreateAddressMutationVariables
  >(CREATE_ADDRESS_MUTATION);
  const [updateAddress] = useMutation<
    UpdateAddressMutationResponse,
    UpdateAddressMutationVariables
  >(UPDATE_ADDRESS_MUTATION);
  const [deleteAddress] = useMutation<
    DeleteAddressMutationResponse,
    DeleteAddressMutationVariables
  >(DELETE_ADDRESS_MUTATION);

  const loadMoreAddresses = async () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    await getMoreAddresses({
      variables: {
        filter: {
          page: nextPage,
          limit: 10,
        },
      },
    });
  };

  const handleFormSubmit = async (data: AddressFormValues) => {
    try {
      if (editingId && editingAddress) {
        const { data: updatedAddress } = await updateAddress({
          variables: {
            id: editingAddress._id,
            request: {
              ...data,
            },
          },
        });

        if (updatedAddress) {
          setAddresses((prev) =>
            prev.map((addr) =>
              String(addr._id) === String(editingAddress._id)
                ? updatedAddress.updateMyAddress
                : addr
            )
          );
          toast.success(addressTranslate[lang].function.handleSaveEdit.success);
        }
      } else {
        const { data: newAddress } = await createAddress({
          variables: {
            request: {
              ...data,
            },
          },
        });

        if (newAddress) {
          setAddresses((prev) => [newAddress.addAddress, ...prev]);
          setTotalCount((prev) => prev + 1); // Increment total when adding new address
          toast.success(
            addressTranslate[lang].function.handleAddAddress.success
          );
        }
      }
      setShowForm(false);
      setEditingId(null);
      setEditingAddress(null);
    } catch (error) {
      toast.error(
        (error as Error).message || addressTranslate[lang].error.global
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddress({
        variables: {
          id,
        },
      });
      setAddresses((prev) => prev.filter((addr) => addr._id !== id));
      setTotalCount((prev) => prev - 1); // Decrement total when deleting address
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {addressTranslate[lang].title.main}
        </h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Showing {addresses.length} of {totalCount} addresses
          </div>
          <div className="text-xs text-gray-500">
            {totalCount === 0
              ? "No addresses saved"
              : addresses.length === totalCount
                ? "All addresses loaded"
                : `${totalCount - addresses.length} more available`}
          </div>
        </div>
      </div>

      <div className="mb-8">
        {!showForm && !editingId && (
          <button
            onClick={() => {
              setShowForm(true);
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {addressTranslate[lang].button.addNewAddress}
          </button>
        )}

        {showForm || editingId ? (
          <AddressForm
            defaultValues={editingAddress ?? undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
              setEditingAddress(null);
            }}
            isEditing={!!editingId}
          />
        ) : null}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {addressTranslate[lang].title.subTitle}
        </h2>

        {loadingMore && addresses.length === 0 ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700">
                  Loading your addresses...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while we fetch your saved addresses
                </p>
              </div>
            </div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses yet
            </h3>
            <p className="text-gray-500">
              Add your first address to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {addresses.map((address) => (
              <div key={address._id} className="p-4 bg-white rounded shadow">
                {editingId === address._id ? (
                  <AddressForm
                    defaultValues={address}
                    onSubmit={handleFormSubmit}
                    onCancel={() => {
                      setEditingId(null);
                      setEditingAddress(null);
                    }}
                    isEditing
                  />
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="font-medium">{address.street}</p>
                      <p>
                        {address.city}, {address.state} {address.postal_code}
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
                          setEditingId(address._id);
                          setEditingAddress(address);
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
        )}

        {/* Progress Bar */}
        {totalCount > 0 && (
          <div className="mt-4 mb-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round((addresses.length / totalCount) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(addresses.length / totalCount) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading Spinner for fetching more */}
        {loadingMore === true && (
          <div className="flex justify-center items-center py-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600">Loading more addresses...</p>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {!loadingMore && hasMore && addresses.length < totalCount ? (
          <div className="text-center">
            <button
              onClick={loadMoreAddresses}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors inline-flex items-center space-x-2"
            >
              <span>
                Load More ({Math.min(10, totalCount - addresses.length)} of{" "}
                {totalCount - addresses.length} remaining)
              </span>
            </button>
          </div>
        ) : !loadingMore && totalCount > 0 && addresses.length >= totalCount ? (
          <div className="text-center mt-4">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full">
              <span>✅</span>
              <span className="font-medium">
                All {totalCount} addresses loaded!
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AddressBook;
