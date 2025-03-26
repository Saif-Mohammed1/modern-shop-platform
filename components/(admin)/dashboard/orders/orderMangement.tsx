"use client";
import { type FC, useEffect, useState } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import Link from "next/link";
import { FiTrash2, FiEye, FiCalendar } from "react-icons/fi";
import {
  ordersTranslate,
  StatusColors,
} from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";
import Pagination, {
  type PaginationType,
} from "@/components/pagination/Pagination";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { type OrderType } from "@/app/lib/types/orders.types";
// import StatusBadge from "@/components/ui/StatusBadge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SkeletonTable from "@/components/ui/SkeletonTable";
import toast from "react-hot-toast";
import { OrderStatus } from "@/app/lib/types/orders.types";
import SearchBar from "@/components/ui/SearchBar";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { HiFilter } from "react-icons/hi";
import MobileFilter from "@/components/ui/MobileFilter";
// import { RelativeTime } from "@/app/(auth)/(admin)/dashboard/users/[id]/userMangement";
import { DateTime } from "luxon";

type StatusOption = {
  value: OrderStatus;
  label: string;
};

const statusOptions: StatusOption[] = [
  {
    value: OrderStatus.Pending,
    label: ordersTranslate.orders[lang].filter.select.options.pending,
  },
  {
    value: OrderStatus.Processing,
    label: ordersTranslate.orders[lang].filter.select.options.processing,
  },
  {
    value: OrderStatus.Shipped,
    label: ordersTranslate.orders[lang].filter.select.options.shipped,
  },
  {
    value: OrderStatus.Delivered,
    label: ordersTranslate.orders[lang].filter.select.options.delivered,
  },
  {
    value: OrderStatus.Completed,
    label: ordersTranslate.orders[lang].filter.select.options.completed,
  },
  {
    value: OrderStatus.Cancelled,
    label: ordersTranslate.orders[lang].filter.select.options.cancelled,
  },
  {
    value: OrderStatus.Refunded,
    label: ordersTranslate.orders[lang].filter.select.options.refunded,
  },
  {
    value: OrderStatus.Failed,
    label: ordersTranslate.orders[lang].filter.select.options.failed,
  },
  {
    value: OrderStatus.OnHold,
    label: ordersTranslate.orders[lang].filter.select.options.on_hold,
  },
  {
    value: OrderStatus.PartiallyRefunded,
    label:
      ordersTranslate.orders[lang].filter.select.options.partially_refunded,
  },
  {
    value: OrderStatus.Disputed,
    label: ordersTranslate.orders[lang].filter.select.options.disputed,
  },
];
interface AdminOrdersDashboardProps {
  initialOrders: OrderType[];
  pagination: PaginationType;
}
const AdminOrdersDashboard: FC<AdminOrdersDashboardProps> = ({
  initialOrders,
  pagination,
}) => {
  const [orders, setOrders] = useState<OrderType[]>(initialOrders || []);
  const [loading, setLoading] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // get all orders that relate to email
  const [searchInput, setSearchInput] = useQueryState(
    "email",
    parseAsString
      .withDefault("")
      .withOptions({ throttleMs: 1000, shallow: false })
  );

  // Query state management
  const [filterStatus, setFilterStatus] = useQueryState(
    "status",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  // Replace single date filter with two date filters
  const [startDate, setStartDate] = useQueryState(
    "startDate",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [endDate, setEndDate] = useQueryState(
    "endDate",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [_currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const handelPageChange = (page: number) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    setOrders(initialOrders);
    new Promise<void>((resolve) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        resolve();
      }, 50);
    });
    window.scrollTo({ top: 1, behavior: "smooth" });
  }, [initialOrders]);

  const handleStatusUpdate = async (id: string, status: OrderStatus) => {
    try {
      await api.put(`/admin/dashboard/orders/${id}`, { status });
      setOrders((prev) =>
        prev.map((order) => (order._id === id ? { ...order, status } : order))
      );
      toast.success(ordersTranslate.functions[lang].handleStatusUpdate.success);
    } catch (error) {
      toast.error(ordersTranslate.functions[lang].error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/dashboard/orders/${id}`);
      setOrders((prev) => prev.filter((order) => order._id !== id));
      toast.success(ordersTranslate.functions[lang].handleDelete.success);
    } catch (error) {
      toast.error(ordersTranslate.functions[lang].error);
    }
  };

  const columns = [
    { id: "orderId", label: ordersTranslate.orders[lang].thead.orderId },
    { id: "user", label: ordersTranslate.orders[lang].thead.user },
    { id: "date", label: ordersTranslate.orders[lang].thead.date },
    {
      id: "totalPrice",
      label: ordersTranslate.orders[lang].thead.totalPrice,
    },
    { id: "status", label: ordersTranslate.orders[lang].thead.status },
    { id: "actions", label: ordersTranslate.orders[lang].thead.actions },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-gray-800 my-3">
        {ordersTranslate.orders[lang].title}
      </h2>{" "}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="md:hidden flex items-center gap-2 my-1 mb-4 p-3 bg-gray-100 rounded-lg shadow-md w-full "
      >
        <HiFilter className="text-xl" />
        {shopPageTranslate[lang].shopPage.content.filters}
      </button>
      <div className="hidden mb-6 md:flex justify-between items-center gap-4">
        {/* <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2"> */}

        <SearchBar
          className="w-full"
          searchQuery={searchInput}
          handleSearch={(e) => setSearchInput(e.target.value)}
          placeholder={
            ordersTranslate.orders[lang].filter.input.search.placeholder
          }
        />
        <Select
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          placeholder={ordersTranslate.orders[lang].filter.select.title}
          // className="w-full sm:w-48"
        />

        {/* <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2"> */}
        <Input
          type="date"
          icon={<FiCalendar />}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
          // className="w-full sm:w-48"
        />
        <Input
          type="date"
          icon={<FiCalendar />}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
          // className="w-full sm:w-48"
        />
        {/* </div> */}
      </div>
      {/* </div> */}
      {isMobileFiltersOpen && (
        <MobileFilter closeFilters={() => setIsMobileFiltersOpen(false)}>
          <div className="mb-6 flex flex-col justify-between  gap-4">
            {/* <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2"> */}

            <SearchBar
              className="w-full"
              searchQuery={searchInput}
              handleSearch={(e) => setSearchInput(e.target.value)}
              placeholder={
                ordersTranslate.orders[lang].filter.input.search.placeholder
              }
              isMobile
            />
            <Select
              options={statusOptions}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              placeholder={
                ordersTranslate.orders[lang].filter.select.options.all
              }
              label={ordersTranslate.orders[lang].filter.select.title}
              id="status"
              // className="w-full sm:w-48"
              isMobile
            />

            {/* <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2"> */}
            <Input
              type="date"
              icon={<FiCalendar />}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              label="Start Date"
              // className="w-full sm:w-48"
            />
            <Input
              type="date"
              icon={<FiCalendar />}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              label="End Date"
              // className="w-full sm:w-48"
            />
            {/* </div> */}
          </div>
        </MobileFilter>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <SkeletonTable columns={columns.length} rows={5} />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-gray-500"
                >
                  {ordersTranslate.orders[lang].tbody.noOrders}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-700 font-mono">
                    #{order._id.slice(-8)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {order.userId.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {/* {moment(order.createdAt).format("MMM D, YYYY")} */}
                    {DateTime.fromJSDate(new Date(order.createdAt)).toFormat(
                      "MMM d, yyyy"
                    )}
                    {/* <RelativeTime date={order.createdAt.toString()} /> */}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      options={statusOptions}
                      onChange={(e) =>
                        handleStatusUpdate(
                          order._id,
                          e.target.value as OrderStatus
                        )
                      }
                      customStyle={StatusColors[order.status]}
                    />
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Link
                      href={`/dashboard/orders/${order._id}`}
                      target="_blank"
                    >
                      <Button variant="ghost" size="sm" icon={<FiEye />} />
                    </Link>
                    <ConfirmModal
                      title={
                        ordersTranslate.functions[lang].handleDelete.confirm
                      }
                      onConfirm={() => handleDelete(order._id)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<FiTrash2 />}
                        danger
                      />
                    </ConfirmModal>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-6">
        <Pagination meta={pagination.meta} onPageChange={handelPageChange} />
      </div>
    </div>
  );
};

export default AdminOrdersDashboard;
