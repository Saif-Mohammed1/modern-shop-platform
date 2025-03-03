"use client";
import { FC, useEffect, useState } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import Link from "next/link";
import moment from "moment";
import { FiEdit, FiTrash2, FiEye, FiSearch, FiCalendar } from "react-icons/fi";
import {
  ordersTranslate,
  StatusColors,
} from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";
import Pagination, { PaginationType } from "@/components/pagination/Pagination";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { OrderType } from "@/app/lib/types/orders.types";
// import StatusBadge from "@/components/ui/StatusBadge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SkeletonTable from "@/components/ui/SkeletonTable";
import toast from "react-hot-toast";
import { OrderStatus } from "@/app/lib/types/orders.types";
import { Event } from "@/app/lib/types/products.types";

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
  const [currentPage, setCurrentPage] = useQueryState(
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
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {ordersTranslate.orders[lang].title}
        </h2>

        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <Input
            icon={<FiSearch className="text-gray-400" />}
            placeholder={
              ordersTranslate.orders[lang].filter.input.search.placeholder
            }
            value={searchInput}
            onChange={(e: Event) => setSearchInput(e.target.value)}
            className="w-full sm:w-64"
          />

          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(value: string) => setFilterStatus(value)}
            placeholder={ordersTranslate.orders[lang].filter.select.title}
            className="w-full sm:w-48"
          />

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <Input
              type="date"
              icon={<FiCalendar />}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
              className="w-full sm:w-48"
            />
            <Input
              type="date"
              icon={<FiCalendar />}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
              className="w-full sm:w-48"
            />
          </div>
        </div>
      </div>

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
                    {order.user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {moment(order.createdAt).format("MMM D, YYYY")}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                    ${order.totalPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={order.status}
                      options={statusOptions}
                      onChange={(value: string) =>
                        handleStatusUpdate(order._id, value as OrderStatus)
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
// ("use client");
// import { FC, useEffect, useState } from "react";
// import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
// import Link from "next/link";
// import moment from "moment";
// import { FiTrash2, FiEye } from "react-icons/fi";
// import {
//   ordersTranslate,
//   StatusColors,
// } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/ordersTranslate";
// import Pagination from "@/components/pagination/Pagination";
// import api from "@/components/util/api";
// import { lang } from "@/components/util/lang";
// import { OrderType, OrderStatus } from "@/app/types/orders.types";
// import Input from "@/components/ui/Input";
// import Button from "@/components/ui/Button";
// import Select from "@/components/ui/Select";
// import ConfirmModal from "@/components/ui/ConfirmModal";
// import SkeletonTable from "@/components/ui/SkeletonTable";
// import toast from "react-hot-toast";
// // import { useDebounce } from "usehooks-ts";

// type StatusOption = {
//   value: OrderStatus;
//   label: string;
// };

// const statusOptions: StatusOption[] = [
//   {
//     value: OrderStatus.pending,
//     label: ordersTranslate.orders[lang].filter.select.options.pending,
//   },
//   {
//     value: OrderStatus.completed,
//     label: ordersTranslate.orders[lang].filter.select.options.completed,
//   },
//   {
//     value: OrderStatus.refunded,
//     label: ordersTranslate.orders[lang].filter.select.options.refunded,
//   },
//   {
//     value: OrderStatus.processing,
//     label: ordersTranslate.orders[lang].filter.select.options.processing,
//   },
//   {
//     value: OrderStatus.cancelled,
//     label: ordersTranslate.orders[lang].filter.select.options.cancelled,
//   },
// ];

// const AdminOrdersDashboard: FC<AdminOrdersDashboardProps> = ({
//   initialOrders,
//   totalPages,
// }) => {
//   const [orders, setOrders] = useState<OrderType[]>(initialOrders || []);
//   const [loading, setLoading] = useState(false);
//   const [searchInput, setSearchInput] = useQueryState(
//     "search",
//     parseAsString
//       .withDefault("")
//       .withOptions({ throttleMs: 1000, shallow: false })
//   );
//   // const debouncedSearch = useDebounce(searchInput, 500);

//   // Query state management
//   const [filterStatus, setFilterStatus] = useQueryState(
//     "status",
//     parseAsString.withDefault("").withOptions({ shallow: false })
//   );
//   const [filterDate, setFilterDate] = useQueryState(
//     "date",
//     parseAsString.withDefault("").withOptions({ shallow: false })
//   );
//   const [currentPage, setCurrentPage] = useQueryState(
//     "page",
//     parseAsInteger.withDefault(1).withOptions({ shallow: false })
//   );

//   // const fetchOrders = useCallback(async () => {
//   //   setLoading(true);
//   //   try {
//   //     const params = new URLSearchParams({
//   //       page: currentPage.toString(),
//   //       status: filterStatus,
//   //       date: filterDate,
//   //       search: debouncedSearch,
//   //     });

//   //     const response = await api.get<OrderType[]>(
//   //       `/admin/dashboard/orders?${params}`
//   //     );
//   //     setOrders(response.data);
//   //   } catch (error) {
//   //     toast.error(ordersTranslate.functions[lang].error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // }, [currentPage, filterStatus, filterDate, debouncedSearch]);

//   // useEffect(() => {
//   //   fetchOrders();
//   // }, [fetchOrders]);

//   const handleStatusUpdate = async (id: string, status: OrderStatus) => {
//     try {
//       await api.put(`/admin/dashboard/orders/${id}`, { status });
//       setOrders((prev) =>
//         prev.map((order) => (order._id === id ? { ...order, status } : order))
//       );
//       toast.success(ordersTranslate.functions[lang].handleStatusUpdate.success);
//     } catch (error) {
//       toast.error(ordersTranslate.functions[lang].error);
//     }
//   };

//   const handleDelete = async (id: string) => {
//     try {
//       await api.delete(`/admin/dashboard/orders/${id}`);
//       setOrders((prev) => prev.filter((order) => order._id !== id));
//       toast.success(ordersTranslate.functions[lang].handleDelete.success);
//     } catch (error) {
//       toast.error(ordersTranslate.functions[lang].error);
//     }
//   };

//   const columns = [
//       { id: "orderId", label: ordersTranslate.orders[lang].thead.orderId },
//       { id: "user", label: ordersTranslate.orders[lang].thead.user },
//       { id: "date", label: ordersTranslate.orders[lang].thead.date },
//       {
//         id: "totalPrice",
//         label: ordersTranslate.orders[lang].thead.totalPrice,
//       },
//       { id: "status", label: ordersTranslate.orders[lang].thead.status },
//       { id: "actions", label: ordersTranslate.orders[lang].thead.actions },
//     ],

//   return (
//     <div className="p-6 max-w-7xl mx-auto bg-white rounded-lg shadow-sm">
//       <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <h2 className="text-2xl font-bold text-gray-800">
//           {ordersTranslate.orders[lang].title}
//         </h2>

//         <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2">
//           <Input
//             icon={<FiSearch className="text-gray-400" />}
//             placeholder={
//               ordersTranslate.orders[lang].filter.input.search.placeholder
//             }
//             value={searchInput}
//             onChange={(e) => setSearchInput(e.target.value)}
//             className="w-full sm:w-64"
//           />

//           <Select
//             options={statusOptions}
//             value={filterStatus}
//             onChange={setFilterStatus}
//             placeholder={ordersTranslate.orders[lang].filter.select.title}
//             className="w-full sm:w-48"
//           />

//           <Input
//             type="date"
//             icon={<FiCalendar className="text-gray-400" />}
//             value={filterDate}
//             onChange={(e) => setFilterDate(e.target.value)}
//             className="w-full sm:w-48"
//           />
//         </div>
//       </div>

//       <div className="overflow-x-auto rounded-lg border border-gray-100">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               {columns.map((column) => (
//                 <th
//                   key={column.id}
//                   className="px-4 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider"
//                 >
//                   {column.label}
//                 </th>
//               ))}
//             </tr>
//           </thead>

//           <tbody className="bg-white divide-y divide-gray-200">
//             {loading ? (
//               <SkeletonTable columns={columns.length} rows={5} />
//             ) : orders.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={columns.length}
//                   className="px-4 py-6 text-center text-gray-500"
//                 >
//                   {ordersTranslate.orders[lang].tbody.noOrders}
//                 </td>
//               </tr>
//             ) : (
//               orders.map((order) => (
//                 <tr
//                   key={order._id}
//                   className="hover:bg-gray-50 transition-colors"
//                 >
//                   <td className="px-4 py-3 text-sm text-gray-700 font-mono">
//                     #{order._id.slice(-8)}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-600">
//                     {order.user.email}
//                   </td>
//                   <td className="px-4 py-3 text-sm text-gray-600">
//                     {moment(order.createdAt).format("MMM D, YYYY")}
//                   </td>
//                   <td className="px-4 py-3 text-sm font-semibold text-gray-700">
//                     ${order.totalPrice.toFixed(2)}
//                   </td>
//                   <td className="px-4 py-3">
//                     <Select
//                       value={order.status}
//                       options={statusOptions}
//                       onChange={(value) =>
//                         handleStatusUpdate(order._id, value as OrderStatus)
//                       }
//                       customStyle={StatusColors[order.status]}
//                     />
//                   </td>
//                   <td className="px-4 py-3 flex items-center gap-2">
//                     <Link
//                       href={`/dashboard/orders/${order._id}`}
//                       target="_blank"
//                     >
//                       <Button variant="ghost" size="sm" icon={<FiEye />} />
//                     </Link>
//                     <ConfirmModal
//                       title={
//                         ordersTranslate.functions[lang].handleDelete.confirm
//                       }
//                       onConfirm={() => handleDelete(order._id)}
//                     >
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         icon={<FiTrash2 />}
//                         danger
//                       />
//                     </ConfirmModal>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="mt-6">
//         <Pagination
//           currentPage={currentPage}
//           onPageChange={setCurrentPage}
//           totalPages={totalPages}
//         />
//       </div>
//     </div>
//   );
// };

// interface AdminOrdersDashboardProps {
//   initialOrders: OrderType[];
//   totalPages: number;
// }

// export default AdminOrdersDashboard;
