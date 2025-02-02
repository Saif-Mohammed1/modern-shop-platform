"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/components/util/api";
import toast from "react-hot-toast";
import Pagination from "@/components/pagination/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
import { lang } from "@/components/util/lang";
import { Event } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { updateQueryParams } from "@/components/util/updateQueryParams";
type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};
type Props = {
  users: User[];
  totalPages: number;
};

const AdminUsers = ({ users, totalPages }: Props) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParamsReadOnly = useSearchParams();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [usersList, setUsersList] = useState(users || []);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const handleDelete = async (id: string) => {
    if (confirm(usersTranslate.users[lang].functions.handleDelete.confirm)) {
      let toastLoading;
      try {
        toastLoading = toast.loading(
          usersTranslate.users[lang].functions.handleDelete.loading
        );
        await api.delete(`/admin/dashboard/users/${id}`);
        toast.success(
          usersTranslate.users[lang].functions.handleDelete.success
        );
        setUsersList((prev) => prev.filter((user) => user._id !== id));
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(
            error?.message || usersTranslate.users[lang].error.global
          );
        } else {
          toast.error(usersTranslate.users[lang].error.global);
        }
      } finally {
        toast.dismiss(toastLoading);
      }
    } else {
      toast.success(usersTranslate.users[lang].functions.handleDelete.canceled);
    }
  };

  // const updateQueryParams = (params) => {
  //   const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
  //   for (const key in params) {
  //     if (params[key] === "") {
  //       paramsSearch.delete(key);
  //     } else {
  //       paramsSearch.set(key, params[key]);
  //     }
  //   }

  //   router.push(pathName + "?" + paramsSearch.toString());
  // };

  const handleSearch = (event: Event) => {
    const value = event.target.value;
    setSearch(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateQueryParams(
        { email: value },
        searchParamsReadOnly,
        router,
        pathName
      );
    }, 1000); // Adjust the debounce delay as needed
  };
  const handleRole = (event: Event) => {
    const value = event.target.value;
    setRoleFilter(value);

    updateQueryParams({ role: value }, searchParamsReadOnly, router, pathName);
  };
  const handleActive = (event: Event) => {
    const value = event.target.value;
    setActivityFilter(value);

    updateQueryParams(
      { active: value },
      searchParamsReadOnly,
      router,
      pathName
    );
  };

  const onPaginationChange = (page: number) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    setCurrentPage(page);

    if (page === 1) {
      paramsSearch.delete("page");
      router.push(pathName + "?" + paramsSearch.toString());
      return;
    }
    updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
  };
  useEffect(() => {
    setUsersList(users);
  }, [users]);
  useEffect(() => {
    if (searchParamsReadOnly.has("email")) {
      setSearch(searchParamsReadOnly.get("email") ?? "");
    }
    if (searchParamsReadOnly.has("active")) {
      setActivityFilter(searchParamsReadOnly.get("active") ?? "");
    }
    if (searchParamsReadOnly.has("role")) {
      setRoleFilter(searchParamsReadOnly.get("role") ?? "");
    }
    if (searchParamsReadOnly.has("page")) {
      if (Number(searchParamsReadOnly.get("page")) == 1) {
        const paramsSearch = new URLSearchParams(
          searchParamsReadOnly.toString()
        );

        paramsSearch.delete("page");
        router.push(pathName + "?" + paramsSearch.toString());
        setCurrentPage(1);
        return;
      }

      setCurrentPage(Number(searchParamsReadOnly.get("page")));
    }
  }, [searchParamsReadOnly.toString()]);

  return (
    <div className="container mx-auto p-6 bg-gray-200">
      <h1 className="text-2xl font-bold mb-4 text-center">
        {usersTranslate.users[lang].details.title}
      </h1>

      <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <input
          type="text"
          placeholder={usersTranslate.users[lang].filter.search.placeholder}
          value={search}
          onChange={handleSearch}
          className="p-2 border rounded w-full md:w-auto"
        />
        <select
          className="p-2 border rounded w-full md:w-auto"
          value={roleFilter}
          onChange={handleRole}
        >
          <option value="">
            {usersTranslate.users[lang].filter.select.role.title}
          </option>
          <option value="user">
            {usersTranslate.users[lang].filter.select.role.options.user}
          </option>
          {/* <option value="seller">Seller</option> */}
          <option value="admin">
            {usersTranslate.users[lang].filter.select.role.options.admin}
          </option>
        </select>
        <select
          className="p-2 border rounded w-full md:w-auto"
          value={activityFilter}
          onChange={handleActive}
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
          className=" inline-block bg-blue-600 text-white p-2 rounded text-center w-full md:w-auto"
        >
          {usersTranslate.users[lang].button.addUsers}
        </Link>
      </div>

      <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">
                {usersTranslate.users[lang].details.thead.name}
              </th>
              <th className="py-2 px-4">
                {usersTranslate.users[lang].details.thead.email}
              </th>
              <th className="py-2 px-4">
                {usersTranslate.users[lang].details.thead.role}
              </th>
              <th className="py-2 px-4">
                {usersTranslate.users[lang].details.thead.status}
              </th>
              <th className="py-2 px-4">
                {usersTranslate.users[lang].details.thead.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {usersList.map((user) => (
              <tr key={user._id} className="border-b">
                <td className="py-2 px-4">{user.name.split(" ")[0]}</td>
                <td className="py-2 px-4">{user.email}</td>
                <td className="py-2 px-4">{user.role}</td>
                <td className="py-2 px-4">
                  {user.active ? "Active" : "Inactive"}
                </td>
                <td className="py-2 px-4 flex space-x-2">
                  <Link
                    href={`/dashboard/users/edit/${user._id}`}
                    target="_blank"
                  >
                    <span className="text-blue-600 cursor-pointer">
                      {usersTranslate.users[lang].button.edit}
                    </span>
                  </Link>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(user._id)}
                  >
                    {usersTranslate.users[lang].button.delete}{" "}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        onPageChange={onPaginationChange}
        totalPages={totalPages}
      />
    </div>
  );
};

export default AdminUsers;
