// "use client";
// import { useEffect, useRef, useState } from "react";
// import Link from "next/link";
// import api from "@/components/util/api";
// import toast from "react-hot-toast";
// import Pagination from "@/components/pagination/Pagination";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
// import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
// import { lang } from "@/components/util/lang";
// import { updateQueryParams } from "@/components/util/updateQueryParams";
// import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
// import { Event } from "@/app/types/products.types";
// type User = {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   active: boolean;
// };
// type Props = {
//   users: User[];
//   totalPages: number;
// };

// const AdminUsers = ({ users, totalPages }: Props) => {
//   const router = useRouter();
//   // const pathName = usePathname();
//   // const searchParamsReadOnly = useSearchParams();
//   // const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
//   const [usersList, setUsersList] = useState(users || []);
//   const [search, setSearch] = useQueryState(
//     "email",
//     parseAsString
//       .withDefault("")
//       .withOptions({ shallow: false, throttleMs: 1000 })
//   );

//   const [roleFilter, setRoleFilter] = useQueryState(
//     "role",
//     parseAsString.withDefault("")
//   );
//   const [activityFilter, setActivityFilter] = useQueryState(
//     "active",
//     parseAsString.withDefault("")
//   );
//   const [currentPage, setCurrentPage] = useQueryState(
//     "page",
//     parseAsInteger.withDefault(1).withOptions({ shallow: false })
//   );
//   const handleDelete = async (id: string) => {
//     if (confirm(usersTranslate.users[lang].functions.handleDelete.confirm)) {
//       let toastLoading;
//       try {
//         toastLoading = toast.loading(
//           usersTranslate.users[lang].functions.handleDelete.loading
//         );
//         await api.delete(`/admin/dashboard/users/${id}`);
//         toast.success(
//           usersTranslate.users[lang].functions.handleDelete.success
//         );
//         setUsersList((prev) => prev.filter((user) => user._id !== id));
//       } catch (error: unknown) {
//         if (error instanceof Error) {
//           toast.error(
//             error?.message || usersTranslate.users[lang].error.global
//           );
//         } else {
//           toast.error(usersTranslate.users[lang].error.global);
//         }
//       } finally {
//         toast.dismiss(toastLoading);
//       }
//     } else {
//       toast.success(usersTranslate.users[lang].functions.handleDelete.canceled);
//     }
//   };

//   // const updateQueryParams = (params) => {
//   //   const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
//   //   for (const key in params) {
//   //     if (params[key] === "") {
//   //       paramsSearch.delete(key);
//   //     } else {
//   //       paramsSearch.set(key, params[key]);
//   //     }
//   //   }

//   //   router.push(pathName + "?" + paramsSearch.toString());
//   // };

//   const handleSearch = (event: Event) => {
//     const value = event.target.value;
//     setSearch(value);

//     // if (debounceTimeout.current) {
//     //   clearTimeout(debounceTimeout.current);
//     // }

//     // debounceTimeout.current = setTimeout(() => {
//     //   updateQueryParams(
//     //     { email: value },
//     //     searchParamsReadOnly,
//     //     router,
//     //     pathName
//     //   );
//     // }, 1000); // Adjust the debounce delay as needed
//   };
//   const handleRole = (event: Event) => {
//     const value = event.target.value;
//     setRoleFilter(value);

//     // updateQueryParams({ role: value }, searchParamsReadOnly, router, pathName);
//   };
//   const handleActive = (event: Event) => {
//     const value = event.target.value;
//     setActivityFilter(value);

//     // updateQueryParams(
//     //   { active: value },
//     //   searchParamsReadOnly,
//     //   router,
//     //   pathName
//     // );
//   };

//   const onPaginationChange = (page: number) => {
//     // const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
//     setCurrentPage(page);

//     // if (page === 1) {
//     //   paramsSearch.delete("page");
//     //   router.push(pathName + "?" + paramsSearch.toString());
//     //   return;
//     // }
//     // updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
//   };
//   useEffect(() => {
//     setUsersList(users);
//   }, [users]);
//   // useEffect(() => {
//   //   if (searchParamsReadOnly.has("email")) {
//   //     setSearch(searchParamsReadOnly.get("email") ?? "");
//   //   }
//   //   if (searchParamsReadOnly.has("active")) {
//   //     setActivityFilter(searchParamsReadOnly.get("active") ?? "");
//   //   }
//   //   if (searchParamsReadOnly.has("role")) {
//   //     setRoleFilter(searchParamsReadOnly.get("role") ?? "");
//   //   }
//   //   if (searchParamsReadOnly.has("page")) {
//   //     if (Number(searchParamsReadOnly.get("page")) == 1) {
//   //       const paramsSearch = new URLSearchParams(
//   //         searchParamsReadOnly.toString()
//   //       );

//   //       paramsSearch.delete("page");
//   //       router.push(pathName + "?" + paramsSearch.toString());
//   //       setCurrentPage(1);
//   //       return;
//   //     }

//   //     setCurrentPage(Number(searchParamsReadOnly.get("page")));
//   //   }
//   // }, [searchParamsReadOnly.toString()]);

//   return (
//     <div className="container mx-auto p-6 bg-gray-200">
//       <h1 className="text-2xl font-bold mb-4 text-center">
//         {usersTranslate.users[lang].details.title}
//       </h1>

//       <div className="flex flex-col md:flex-row items-center mb-4 space-y-2 md:space-y-0 md:space-x-2">
//         <input
//           type="text"
//           placeholder={usersTranslate.users[lang].filter.search.placeholder}
//           value={search}
//           onChange={handleSearch}
//           className="p-2 border rounded w-full md:w-auto"
//         />
//         <select
//           className="p-2 border rounded w-full md:w-auto"
//           value={roleFilter}
//           onChange={handleRole}
//         >
//           <option value="">
//             {usersTranslate.users[lang].filter.select.role.title}
//           </option>
//           <option value="user">
//             {usersTranslate.users[lang].filter.select.role.options.user}
//           </option>
//           {/* <option value="seller">Seller</option> */}
//           <option value="admin">
//             {usersTranslate.users[lang].filter.select.role.options.admin}
//           </option>
//         </select>
//         <select
//           className="p-2 border rounded w-full md:w-auto"
//           value={activityFilter}
//           onChange={handleActive}
//         >
//           <option value="">
//             {usersTranslate.users[lang].filter.select.activity.title}
//           </option>
//           <option value="true">
//             {usersTranslate.users[lang].filter.select.activity.options.active}
//           </option>
//           <option value="false">
//             {usersTranslate.users[lang].filter.select.activity.options.inactive}
//           </option>
//         </select>
//         <Link
//           href="/dashboard/users/add"
//           className=" inline-block bg-blue-600 text-white p-2 rounded text-center w-full md:w-auto"
//         >
//           {usersTranslate.users[lang].button.addUsers}
//         </Link>
//       </div>

//       <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
//         <table className="w-full bg-white shadow-md rounded-lg">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="py-2 px-4">
//                 {usersTranslate.users[lang].details.thead.name}
//               </th>
//               <th className="py-2 px-4">
//                 {usersTranslate.users[lang].details.thead.email}
//               </th>
//               <th className="py-2 px-4">
//                 {usersTranslate.users[lang].details.thead.role}
//               </th>
//               <th className="py-2 px-4">
//                 {usersTranslate.users[lang].details.thead.status}
//               </th>
//               <th className="py-2 px-4">
//                 {usersTranslate.users[lang].details.thead.actions}
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {usersList.map((user) => (
//               <tr key={user._id} className="border-b">
//                 <td className="py-2 px-4">{user.name.split(" ")[0]}</td>
//                 <td className="py-2 px-4">{user.email}</td>
//                 <td className="py-2 px-4">{user.role}</td>
//                 <td className="py-2 px-4">
//                   {user.active ? "Active" : "Inactive"}
//                 </td>
//                 <td className="py-2 px-4 flex space-x-2">
//                   <Link
//                     href={`/dashboard/users/edit/${user._id}`}
//                     target="_blank"
//                   >
//                     <span className="text-blue-600 cursor-pointer">
//                       {usersTranslate.users[lang].button.edit}
//                     </span>
//                   </Link>
//                   <button
//                     className="text-red-600"
//                     onClick={() => handleDelete(user._id)}
//                   >
//                     {usersTranslate.users[lang].button.delete}{" "}
//                   </button>
//                 </td>
//               </tr>
//             ))}
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

// export default AdminUsers;
"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/components/util/api";
import toast from "react-hot-toast";
import Pagination from "@/components/pagination/Pagination";
import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
import { lang } from "@/components/util/lang";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import type { ChangeEvent } from "react";

type UserAuthType = {
  _id: string;
  name: string;
  email: string;
  emailVerify: boolean;
  role: string;
  createdAt: Date;
  phone?: string;
  active: boolean;
  isTwoFactorAuthEnabled: boolean;
};

type Props = {
  users: UserAuthType[];
  totalPages: number;
};

const AdminUsers = ({ users, totalPages }: Props) => {
  const [usersList, setUsersList] = useState(users || []);
  const [search, setSearch] = useQueryState(
    "email",
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
    setUsersList(users);
  }, [users]);

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
                    className={`px-2 py-1 rounded-full text-xs font-medium ${user.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {user.active
                      ? usersTranslate.users[lang].filter.select.activity
                          .options.active
                      : usersTranslate.users[lang].filter.select.activity
                          .options.inactive}
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
        <Pagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default AdminUsers;
