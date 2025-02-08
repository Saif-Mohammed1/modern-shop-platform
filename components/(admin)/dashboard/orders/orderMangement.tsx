// "use client";
// import { ordersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/ordersTranslate";
// import { OrderStatus } from "@/app/types/orders.types";
// import { Event } from "@/app/types/products.types";
// import Pagination from "@/components/pagination/Pagination";
// import api from "@/components/util/api";
// import { lang } from "@/components/util/lang";
// import { updateQueryParams } from "@/components/util/updateQueryParams";
// import moment from "moment/moment";
// import Link from "next/link";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { FC, useEffect, useRef, useState } from "react";
// import toast from "react-hot-toast";
// type Order = {
//   _id: string;
//   user: { email: string };
//   createdAt: string;
//   totalPrice: number;
//   status: string;
// };
// type AdminOrdersDashboardProps = {
//   orders: Order[];
//   totalPages: number;
// };
// const AdminOrdersDashboard: FC<AdminOrdersDashboardProps> = ({
//   orders,
//   totalPages,
// }) => {
//   const router = useRouter();
//   const pathName = usePathname();
//   const searchParamsReadOnly = useSearchParams();
//   const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
//   const [ordersList, setOrdersList] = useState<Order[]>(orders || []);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const handleDelete = async (id: string) => {
//     if (confirm(ordersTranslate.functions[lang].handleDelete.confirm)) {
//       let toastLoading;
//       try {
//         toastLoading = toast.loading(
//           ordersTranslate.functions[lang].handleDelete.loading
//         );
//         await api.delete(`/admin/dashboard/orders/${id}`);
//         toast.success(ordersTranslate.functions[lang].handleDelete.success);
//         setOrdersList((prev) => prev.filter((order) => order._id !== id));
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           toast.error(error.message || ordersTranslate.functions[lang].error);
//         } else {
//           toast.error(ordersTranslate.functions[lang].error);
//         }
//       } finally {
//         toast.dismiss(toastLoading);
//       }
//     } else {
//       toast.success(ordersTranslate.functions[lang].handleDelete.canceled);
//     }
//   };

//   // const updateQueryParams = (params: {
//   //   [key: string]: string | number;
//   // }): void => {
//   //   const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
//   //   for (const key in params) {
//   //     if (params[key] === "") {
//   //       paramsSearch.delete(key);
//   //     } else {
//   //       const value = params[key].toString(); // Ensure the value is a string

//   //       paramsSearch.set(key, value);
//   //     }
//   //   }

//   //   router.push(pathName + "?" + paramsSearch.toString());
//   // };

//   const handleSearch = (event: Event) => {
//     const value = event.target.value;
//     setSearchQuery(value);

//     if (debounceTimeout.current) {
//       clearTimeout(debounceTimeout.current);
//     }

//     debounceTimeout.current = setTimeout(async () => {
//       // updateQueryParams(
//       //   { "order-id": value },
//       //   searchParamsReadOnly,
//       //   router,
//       //   pathName
//       // );
//       await api
//         .get(`/admin/dashboard/orders/${value}`)
//         .then((res) => {
//           setOrdersList([res.data.data]);
//         })
//         .catch(() => {
//           setOrdersList([]);
//         });
//     }, 1000); // Adjust the debounce delay as needed
//   };
//   const handleFilterDate = (event: Event) => {
//     const value = event.target.value;
//     setFilterDate(value);

//     updateQueryParams({ date: value }, searchParamsReadOnly, router, pathName);
//   };
//   const handleFilterStatus = (event: Event) => {
//     const value = event.target.value;
//     setFilterStatus(value);

//     updateQueryParams(
//       { status: value },
//       searchParamsReadOnly,
//       router,
//       pathName
//     );
//   };

//   const handleStatusUpdate = async (id: string, status: OrderStatus) => {
//     let toastLoading;
//     try {
//       toastLoading = toast.loading(
//         ordersTranslate.functions[lang].handleStatusUpdate.loading
//       );

//       await api.put(`/admin/dashboard/orders/${id}`, { status });
//       setOrdersList((prev) =>
//         prev.map((order) => {
//           if (order._id === id) {
//             return { ...order, status };
//           }
//           return order;
//         })
//       );
//       toast.success(ordersTranslate.functions[lang].handleStatusUpdate.success);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         toast.error(error.message || ordersTranslate.functions[lang].error);
//       } else {
//         toast.error(ordersTranslate.functions[lang].error);
//       }
//     } finally {
//       toast.dismiss(toastLoading);
//     }
//   };
//   const onPaginationChange = (page: number) => {
//     const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
//     setCurrentPage(page);

//     if (page === 1) {
//       paramsSearch.delete("page");
//       router.push(pathName + "?" + paramsSearch.toString());
//       return;
//     }
//     updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
//   };
//   useEffect(() => {
//     setOrdersList(orders);
//   }, [orders]);
//   useEffect(() => {
//     if (searchParamsReadOnly.has("status")) {
//       setFilterStatus(searchParamsReadOnly.get("status") ?? "");
//     }
//     if (searchParamsReadOnly.has("date")) {
//       setFilterDate(searchParamsReadOnly.get("date") ?? "");
//     }
//     if (searchParamsReadOnly.has("order-id")) {
//       setSearchQuery(searchParamsReadOnly.get("order-id") ?? "");
//     }
//     if (searchParamsReadOnly.has("page")) {
//       if (Number(searchParamsReadOnly.get("page")) == 1) {
//         const paramsSearch = new URLSearchParams(
//           searchParamsReadOnly.toString()
//         );

//         paramsSearch.delete("page");
//         router.push(pathName + "?" + paramsSearch.toString());
//         setCurrentPage(1);
//         return;
//       }

//       setCurrentPage(Number(searchParamsReadOnly.get("page")));
//     }
//   }, [searchParamsReadOnly.toString()]);

//   return (
//     <div className="p-6 max-w-7xl mx-auto">
//       <h2 className="text-3xl font-semibold mb-4">
//         {ordersTranslate.orders[lang].title}
//       </h2>
//       {/* Search Bar */}
//       <div className="flex flex-col gap-2 sm:flex-row /items-center space-x-4 mb-6">
//         <input
//           type="text"
//           // readOnly
//           placeholder={
//             ordersTranslate.orders[lang].filter.input.search.placeholder
//           }
//           className="p-2 border border-gray-300 bg-gray-300 rounded-md flex-grow"
//           value={searchQuery}
//           onChange={handleSearch}
//         />
//         <select
//           className="p-2 border border-gray-300 rounded-md"
//           value={filterStatus}
//           onChange={handleFilterStatus}
//         >
//           <option value="">
//             {ordersTranslate.orders[lang].filter.select.title}
//           </option>
//           <option value="pending">
//             {ordersTranslate.orders[lang].filter.select.options.pending}
//           </option>
//           <option value="completed">
//             {ordersTranslate.orders[lang].filter.select.options.completed}
//           </option>
//           <option value="refunded">
//             {ordersTranslate.orders[lang].filter.select.options.refunded}
//           </option>
//           <option value="processing">
//             {ordersTranslate.orders[lang].filter.select.options.processing}
//           </option>
//           <option value="cancelled">
//             {ordersTranslate.orders[lang].filter.select.options.cancelled}
//           </option>
//         </select>
//         <input
//           type="date"
//           className="p-2 border border-gray-300 rounded-md"
//           value={filterDate}
//           onChange={handleFilterDate}
//         />
//         {/* <button
//           onClick={handleSearch}
//           className="p-2 bg-blue-500 text-white rounded-md"
//         >
//           Search
//         </button> */}
//       </div>
//       {/* Orders Table */}{" "}
//       <div className="h-[70vh] overflow-y-auto overflow-x-auto">
//         <table className="min-w-full  table-auto">
//           <thead>
//             <tr>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.orderId}
//               </th>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.user}
//               </th>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.date}
//               </th>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.totalPrice}
//               </th>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.status}
//               </th>
//               <th className="px-4 py-2">
//                 {ordersTranslate.orders[lang].thead.actions}
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {ordersList?.length === 0 ? (
//               <tr>
//                 <td colSpan={6} className="text-center empty mt-10">
//                   {ordersTranslate.orders[lang].tbody.noOrders}
//                 </td>
//               </tr>
//             ) : (
//               ordersList.map((order) => (
//                 <tr key={order._id}>
//                   <td className="border px-4 py-2">{order._id}</td>
//                   <td className="border px-4 py-2">{order.user.email}</td>
//                   <td className="border px-4 py-2">
//                     {moment(order.createdAt).format("DD/MM/YYYY")}
//                   </td>
//                   <td className="border px-4 py-2">${order.totalPrice}</td>
//                   <td className="border px-4 py-2">
//                     <select
//                       value={order.status}
//                       className="p-1 border border-gray-300 rounded-md"
//                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
//                         handleStatusUpdate(
//                           order._id,
//                           e.target.value as OrderStatus
//                         )
//                       }
//                     >
//                       <option value="pending">
//                         {
//                           ordersTranslate.orders[lang].filter.select.options
//                             .pending
//                         }
//                       </option>
//                       <option value="completed">
//                         {
//                           ordersTranslate.orders[lang].filter.select.options
//                             .completed
//                         }
//                       </option>
//                       <option value="refunded">
//                         {
//                           ordersTranslate.orders[lang].filter.select.options
//                             .refunded
//                         }
//                       </option>
//                       <option value="processing">
//                         {
//                           ordersTranslate.orders[lang].filter.select.options
//                             .processing
//                         }
//                       </option>
//                       <option value="cancelled">
//                         {
//                           ordersTranslate.orders[lang].filter.select.options
//                             .cancelled
//                         }
//                       </option>
//                     </select>
//                   </td>
//                   <td className="border px-4 py-2">
//                     <button className="p-2 bg-green-500 text-white rounded-md">
//                       <Link
//                         href={`/dashboard/orders/${order._id}`}
//                         target="_blank"
//                       >
//                         {ordersTranslate.orders[lang].tbody.view}{" "}
//                       </Link>
//                     </button>
//                     <button
//                       onClick={() => handleDelete(order._id)}
//                       className="ml-2 p-2 bg-red-500 text-white rounded-md"
//                     >
//                       {ordersTranslate.orders[lang].tbody.delete}{" "}
//                     </button>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>
//       <Pagination
//         currentPage={currentPage}
//         onPageChange={onPaginationChange}
//         totalPages={totalPages}
//       />
//     </div>
//   );
// };

// export default AdminOrdersDashboard;
"use client";
import { FC, useEffect, useState } from "react";
import { useQueryState, parseAsString, parseAsInteger } from "nuqs";
import Link from "next/link";
import moment from "moment";
import { FiEdit, FiTrash2, FiEye, FiSearch, FiCalendar } from "react-icons/fi";
import {
  ordersTranslate,
  StatusColors,
} from "@/app/_translate/(protectedRoute)/(admin)/dashboard/ordersTranslate";
import Pagination from "@/components/pagination/Pagination";
import api from "@/components/util/api";
import { lang } from "@/components/util/lang";
import { OrderType } from "@/app/types/orders.types";
import StatusBadge from "@/components/ui/StatusBadge";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmModal from "@/components/ui/ConfirmModal";
import SkeletonTable from "@/components/ui/SkeletonTable";
import toast from "react-hot-toast";
import { OrderStatus } from "@/app/types/orders.types";
import { Event } from "@/app/types/products.types";

type StatusOption = {
  value: OrderStatus;
  label: string;
};

const statusOptions: StatusOption[] = [
  {
    value: OrderStatus.pending,
    label: ordersTranslate.orders[lang].filter.select.options.pending,
  },
  {
    value: OrderStatus.completed,
    label: ordersTranslate.orders[lang].filter.select.options.completed,
  },
  {
    value: OrderStatus.refunded,
    label: ordersTranslate.orders[lang].filter.select.options.refunded,
  },
  {
    value: OrderStatus.processing,
    label: ordersTranslate.orders[lang].filter.select.options.processing,
  },
  {
    value: OrderStatus.cancelled,
    label: ordersTranslate.orders[lang].filter.select.options.cancelled,
  },
];

const AdminOrdersDashboard: FC<AdminOrdersDashboardProps> = ({
  initialOrders,
  totalPages,
}) => {
  const [orders, setOrders] = useState<OrderType[]>(initialOrders || []);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useQueryState(
    "search",
    parseAsString
      .withDefault("")
      .withOptions({ throttleMs: 1000, shallow: false })
  );

  // Query state management
  const [filterStatus, setFilterStatus] = useQueryState(
    "status",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [filterDate, setFilterDate] = useQueryState(
    "date",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  useEffect(() => {
    setOrders(initialOrders);
    new Promise<void>((resolve) => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        resolve();
      }, 2000);
    });
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

          <Input
            type="date"
            icon={<FiCalendar className="text-gray-400" />}
            value={filterDate}
            onChange={(e: Event) => setFilterDate(e.target.value)}
            className="w-full sm:w-48"
          />
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
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

interface AdminOrdersDashboardProps {
  initialOrders: OrderType[];
  totalPages: number;
}

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
