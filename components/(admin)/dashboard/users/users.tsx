// export default AdminUsers;
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import Pagination, { PaginationType } from "@/components/pagination/Pagination";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { UserAuthType } from "@/app/lib/types/users.types";

type Props = {
  users: UserAuthType[];
  pagination: PaginationType;
};

const AdminUsers = ({ users, pagination }: Props) => {
  const [usersList, setUsersList] = useState(users || []);
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
    "active",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const onPaginationChange = (page: number) => {
    setCurrentPage(page);
  };
  const handleDelete = async (id: string) => {
    if (confirm(usersTranslate.users[lang].functions.handleDelete.confirm)) {
      let toastId;
      try {
        toastId = toast.loading(
          usersTranslate.users[lang].functions.handleDelete.loading
        );
        await api.delete(`/admin/dashboard/users/${id}`);
        toast.success(
          usersTranslate.users[lang].functions.handleDelete.success
        );
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
    } else {
      toast.success(usersTranslate.users[lang].functions.handleDelete.canceled);
    }
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          type="text"
          placeholder={usersTranslate.users[lang].filter.search.placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <select
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
        </select>
        <Link
          href="/dashboard/users/add"
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-center transition-colors duration-200"
        >
          {usersTranslate.users[lang].button.addUsers}
        </Link>
      </div>

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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.status == "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 space-x-3">
                  <Link
                    href={`/dashboard/users/edit/${user._id}`}
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    {usersTranslate.users[lang].button.edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    {usersTranslate.users[lang].button.delete}
                  </button>
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
