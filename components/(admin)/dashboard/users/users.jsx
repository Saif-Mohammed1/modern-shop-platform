"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import api from "@/components/util/axios.api";
import toast from "react-hot-toast";
import Pagination from "@/components/pagination/Pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const AdminUsers = ({ users, totalPages }) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParamsReadOnly = useSearchParams();
  const debounceTimeout = useRef(null);
  const [usersList, setUsersList] = useState(users || []);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activityFilter, setActivityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this user?")) {
      let toastLoading;
      try {
        toastLoading = toast.loading("deleting user...");
        await api.delete(`/admin/dashboard/users/${id}`);
        toast.success("user deleted");
        setUsersList((prev) => prev.filter((user) => user._id !== id));
      } catch (error) {
        toast.error(error?.message || "something went wrong");
      } finally {
        toast.dismiss(toastLoading);
      }
    } else {
      toast.success("delete canceled");
    }
  };

  const updateQueryParams = (params) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    for (const key in params) {
      if (params[key] === "") {
        paramsSearch.delete(key);
      } else {
        paramsSearch.set(key, params[key]);
      }
    }

    router.push(pathName + "?" + paramsSearch.toString());
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateQueryParams({ email: value });
    }, 1000); // Adjust the debounce delay as needed
  };
  const handleRole = (event) => {
    const value = event.target.value;
    setRoleFilter(value);

    updateQueryParams({ role: value });
  };
  const handleActive = (event) => {
    const value = event.target.value;
    setActivityFilter(value);

    updateQueryParams({ active: value });
  };

  const onPaginationChange = (page) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    setCurrentPage(page);

    if (page === 1) {
      paramsSearch.delete("page");
      router.push(pathName + "?" + paramsSearch.toString());
      return;
    }
    updateQueryParams({ page });
  };
  useEffect(() => {
    setUsersList(users);
  }, [users]);
  useEffect(() => {
    if (searchParamsReadOnly.has("email")) {
      setSearch(searchParamsReadOnly.get("email"));
    }
    if (searchParamsReadOnly.has("active")) {
      setActivityFilter(searchParamsReadOnly.get("active"));
    }
    if (searchParamsReadOnly.has("role")) {
      setRoleFilter(searchParamsReadOnly.get("role"));
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
      <h1 className="text-2xl font-bold mb-4 text-center">Manage Users</h1>

      <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={handleSearch}
          className="p-2 border rounded w-full md:w-auto"
        />
        <select
          className="p-2 border rounded w-full md:w-auto"
          value={roleFilter}
          onChange={handleRole}
        >
          <option value="">Filter by Role</option>
          <option value="user">User</option>
          {/* <option value="seller">Seller</option> */}
          <option value="admin">Admin</option>
        </select>
        <select
          className="p-2 border rounded w-full md:w-auto"
          value={activityFilter}
          onChange={handleActive}
        >
          <option value="">Filter by Activity</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>{" "}
        <Link
          href="/dashboard/users/add"
          className=" inline-block bg-blue-600 text-white p-2 rounded text-center w-full md:w-auto"
        >
          Add New User
        </Link>
      </div>

      <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
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
                    <span className="text-blue-600 cursor-pointer">Edit</span>
                  </Link>
                  <button
                    className="text-red-600"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
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
