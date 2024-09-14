"use client";
import Pagination from "@/components/pagination/Pagination";
import api from "@/components/util/axios.api";
import moment from "moment/moment";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const AdminOrdersDashboard = ({ orders, totalPages }) => {
  const router = useRouter();
  const pathName = usePathname();
  const searchParamsReadOnly = useSearchParams();
  const debounceTimeout = useRef(null);
  const [ordersList, setOrdersList] = useState(orders || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate, setFilterDate] = useState("");
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
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateQueryParams({ user: value });
    }, 1000); // Adjust the debounce delay as needed
  };
  const handleFilterDate = (event) => {
    const value = event.target.value;
    setFilterDate(value);

    updateQueryParams({ date: value });
  };
  const handleFilterStatus = (event) => {
    const value = event.target.value;
    setFilterStatus(value);

    updateQueryParams({ status: value });
  };
  const handleStatusUpdate = async (id, status) => {
    let toastLoading;
    try {
      toastLoading = toast.loading("updating status...");

      await api.put(`/admin/dashboard/orders/${id}`, { status });
      setOrdersList((prev) =>
        prev.map((order) => {
          if (order._id === id) {
            return { ...order, status };
          }
          return order;
        })
      );
      toast.success("status updated");
    } catch (error) {
      toast.error(error?.message || "something went wrong");
    } finally {
      toast.dismiss(toastLoading);
    }
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
    setOrdersList(orders);
  }, [orders]);
  useEffect(() => {
    if (searchParamsReadOnly.has("status")) {
      setFilterStatus(searchParamsReadOnly.get("status"));
    }
    if (searchParamsReadOnly.has("date")) {
      setFilterDate(searchParamsReadOnly.get("date"));
    }
    if (searchParamsReadOnly.has("user")) {
      setSearchQuery(searchParamsReadOnly.get("user"));
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
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-semibold mb-4">Manage Orders</h2>
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row /items-center space-x-4 mb-6">
        <input
          type="text"
          readOnly
          placeholder="Search by Order User"
          className="p-2 border border-gray-300 bg-gray-300 rounded-md flex-grow"
          value={searchQuery}
          onChange={handleSearch}
        />
        <select
          className="p-2 border border-gray-300 rounded-md"
          value={filterStatus}
          onChange={handleFilterStatus}
        >
          <option value="">Filter by Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="refunded">Refunded</option>
          <option value="processing">Processing</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className="p-2 border border-gray-300 rounded-md"
          value={filterDate}
          onChange={handleFilterDate}
        />
        {/* <button
          onClick={handleSearch}
          className="p-2 bg-blue-500 text-white rounded-md"
        >
          Search
        </button> */}
      </div>
      {/* Orders Table */}{" "}
      <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
        <table className="min-w-full  table-auto">
          <thead>
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total Price</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ordersList.map((order) => (
              <tr key={order._id}>
                <td className="border px-4 py-2">{order._id}</td>
                <td className="border px-4 py-2">{order.user.email}</td>
                <td className="border px-4 py-2">
                  {moment(order.createdAt).format("DD/MM/YYYY")}
                </td>
                <td className="border px-4 py-2">${order.totalPrice}</td>
                <td className="border px-4 py-2">
                  <select
                    value={order.status}
                    className="p-1 border border-gray-300 rounded-md"
                    onChange={(e) =>
                      handleStatusUpdate(order._id, e.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="refunded">Refunded</option>
                    <option value="processing">Processing</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="border px-4 py-2">
                  <button className="p-2 bg-green-500 text-white rounded-md">
                    <Link
                      href={`/dashboard/orders/${order._id}`}
                      target="_blank"
                    >
                      View
                    </Link>
                  </button>
                  <button
                    onClick={() => handleDelete(order._id)}
                    className="ml-2 p-2 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>{" "}
      <Pagination
        currentPage={currentPage}
        onPageChange={onPaginationChange}
        totalPages={totalPages}
      />
    </div>
  );
};

export default AdminOrdersDashboard;
