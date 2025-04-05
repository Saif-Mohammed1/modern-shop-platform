// export default AdminUsers;
"use client";

import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckSquare, FiEdit, FiTrash2, FiUser } from "react-icons/fi";
import { HiFilter } from "react-icons/hi";

import type { Event } from "@/app/lib/types/products.types";
import {
  type UserAuthType,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { statusStyles } from "@/app/lib/utilities/status-style";
import Pagination, {
  type PaginationType,
} from "@/components/pagination/Pagination";
import ConfirmModal from "@/components/ui/ConfirmModal";
import MobileFilter from "@/components/ui/MobileFilter";
import SearchBar from "@/components/ui/SearchBar";
import Select from "@/components/ui/Select";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

// export default AdminUsers;

type Props = {
  users: UserAuthType[];
  pagination: PaginationType;
};

const AdminUsers = ({ users, pagination }: Props) => {
  const [usersList, setUsersList] = useState(users || []);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 1000 })
  );
  const [roleFilter, setRoleFilter] = useQueryState(
    "role",

    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [activityFilter, setActivityFilter] = useQueryState(
    "status",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const onPaginationChange = (page: number) => {
    void setCurrentPage(page);
  };
  // const handleDelete = async (id: string) => {
  //   if (confirm(usersTranslate.users[lang].functions.handleDelete.confirm)) {
  //     let toastId;
  //     try {
  //       toastId = toast.loading(
  //         usersTranslate.users[lang].functions.handleDelete.loading
  //       );
  //       await api.delete(`/admin/dashboard/users/${id}`);
  //       toast.success(
  //         usersTranslate.users[lang].functions.handleDelete.success
  //       );
  //       setUsersList((prev) => prev.filter((user) => user._id !== id));
  //     } catch (error: unknown) {
  //       toast.error(
  //         error instanceof Error
  //           ? error.message
  //           : usersTranslate.users[lang].error.global
  //       );
  //     } finally {
  //       toast.dismiss(toastId);
  //     }
  //   } else {
  //     toast.success(usersTranslate.users[lang].functions.handleDelete.canceled);
  //   }
  // };
  const handleDeleteUser = async (id: string) => {
    let toastId;
    try {
      toastId = toast.loading(
        usersTranslate.users[lang].functions.handleDelete.loading
      );
      await api.delete(`/admin/dashboard/users/${id}`);
      toast.success(usersTranslate.users[lang].functions.handleDelete.success);
      setUsersList((prev) => prev.filter((user) => user._id !== id));
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : usersTranslate.users[lang].error.global
      );
    } finally {
      toast.dismiss(toastId);
    }
  };

  const handleSearchChanges = (e: Event) => {
    void setSearch(e.target.value);
  };
  useEffect(() => {
    window.scrollTo({ top: 1, behavior: "smooth" });
    setUsersList(users);
  }, [users, currentPage, search, roleFilter, activityFilter]);
  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        {usersTranslate.users[lang].details.title}
      </h1>
      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="md:hidden flex items-center gap-2 my-1 mb-4 p-3 bg-gray-100 rounded-lg shadow-md w-full "
      >
        <HiFilter className="text-xl" />
        {shopPageTranslate[lang].shopPage.content.filters}
      </button>

      <div className="hidden md:flex  flex-row items-center justify-between gap-4">
        {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6"> */}
        {/* <input
          type="text"
          placeholder={usersTranslate.users[lang].filter.search.placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        /> */}
        <SearchBar
          className="w-full"
          searchQuery={search}
          handleSearch={handleSearchChanges}
          placeholder={usersTranslate.users[lang].filter.search.placeholder}
        />
        {/* Role Selector */}
        <Select
          // className="w-full md:w-1/4"
          options={Object.values(UserRole).map((role) => ({
            value: role,
            label: usersTranslate.users[lang].addUsers.form.roles[role],
          }))}
          value={roleFilter}
          onChange={(e) => void setRoleFilter(e.target.value)}
          placeholder={usersTranslate.users[lang].addUsers.form.role.label}
          icon={<FiUser />}
        />

        {/* Status Selector */}
        <Select
          // className="w-full md:w-1/4"
          options={Object.values(UserStatus).map((status) => ({
            value: status,
            label: usersTranslate.users[lang].addUsers.form.statuses[status],
          }))}
          value={activityFilter}
          onChange={(e) => void setActivityFilter(e.target.value)}
          placeholder={usersTranslate.users[lang].filter.select.activity.title}
          icon={<FiCheckSquare />}
        />
        {/* <select
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">
            {usersTranslate.users[lang].filter.select.role.title}
          </option>
          <option value="user">
            {usersTranslate.users[lang].filter.select.role.options.user}
          </option>
          <option value="admin">
            {usersTranslate.users[lang].filter.select.role.options.admin}
          </option>
        </select>
        <select
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value)}
        >
          <option value="">
            {usersTranslate.users[lang].filter.select.activity.title}
          </option>
          <option value="true">
            {usersTranslate.users[lang].filter.select.activity.options.active}
          </option>
          <option value="false">
            {usersTranslate.users[lang].filter.select.activity.options.inactive}
          </option>
        </select> */}
        <p className="min-w-fit my-4 md:my-0 bg-blue-600 hover:bg-blue-700 text-white p-2  rounded text-center transition-colors duration-200">
          <Link href="/dashboard/users/add">
            {usersTranslate.users[lang].button.addUsers}
          </Link>
        </p>
      </div>
      {isMobileFiltersOpen ? (
        <MobileFilter closeFilters={() => setIsMobileFiltersOpen(false)}>
          <div className="flex  flex-col items-center justify-between gap-4">
            <SearchBar
              className="w-full"
              searchQuery={search}
              handleSearch={handleSearchChanges}
              placeholder={usersTranslate.users[lang].filter.search.placeholder}
              isMobile
            />
            {/* Role Selector */}
            <Select
              className="w-full md:w-1/4"
              options={Object.values(UserRole).map((role) => ({
                value: role,
                label: usersTranslate.users[lang].addUsers.form.roles[role],
              }))}
              value={roleFilter}
              onChange={(e) => void setRoleFilter(e.target.value)}
              placeholder={
                usersTranslate.users[lang].filter.select.activity.all
              }
              id="role"
              label={usersTranslate.users[lang].addUsers.form.role.label}
              icon={<FiUser />}
              isMobile
            />

            {/* Status Selector */}
            <Select
              className="w-full md:w-1/4"
              options={Object.values(UserStatus).map((status) => ({
                value: status,
                label:
                  usersTranslate.users[lang].addUsers.form.statuses[status],
              }))}
              value={activityFilter}
              onChange={(e) => void setActivityFilter(e.target.value)}
              placeholder={
                usersTranslate.users[lang].filter.select.activity.all
              }
              id="activity"
              label={usersTranslate.users[lang].filter.select.activity.title}
              icon={<FiCheckSquare />}
              isMobile
            />

            <Link
              href="/dashboard/users/add"
              className="my-2 bg-blue-600 hover:bg-blue-700 text-white p-2 w-full rounded text-center transition-colors duration-200"
            >
              {usersTranslate.users[lang].button.addUsers}
            </Link>
          </div>
        </MobileFilter>
      ) : null}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              {(["name", "email", "role", "status", "actions"] as const).map(
                (header, index) => (
                  <th
                    key={index}
                    className="py-3 px-4 text-left text-sm font-semibold text-gray-700"
                  >
                    {usersTranslate.users[lang].details.thead[header]}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usersList.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-sm text-gray-700">{user.name}</td>
                <td className="py-3 px-4 text-sm text-gray-700">
                  {user.email}
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{user.role}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles(
                      user.status
                    )}`}
                    // className={`px-2 py-1 rounded-full text-xs font-medium ${user.status == "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user.status}
                  </span>
                </td>
                {/* <td className="flex  gap-2  bg-red"> */}
                <td className="flex py-3 px-4 space-x-3">
                  <Link
                    href={`/dashboard/users/edit/${user._id}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {/* {usersTranslate.users[lang].button.edit}
                     */}
                    <FiEdit size={20} />
                  </Link>
                  {/* <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    {/* {usersTranslate.users[lang].button.delete} */}
                  {/* <FiTrash2 size={20} />
                  </button>  */}

                  <ConfirmModal
                    title={
                      usersTranslate.users[lang].editUsers.actions.deleteConfirm
                    }
                    onConfirm={() => void handleDeleteUser(user._id)}
                    // confirmVariant="destructive"
                  >
                    <button className="text-red-600 hover:text-red-800 transition-colors">
                      {/* {usersTranslate.users[lang].button.delete} */}
                      <FiTrash2 size={20} />
                    </button>
                  </ConfirmModal>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        {" "}
        <Pagination meta={pagination.meta} onPageChange={onPaginationChange} />
      </div>
    </div>
  );
};

export default AdminUsers;
