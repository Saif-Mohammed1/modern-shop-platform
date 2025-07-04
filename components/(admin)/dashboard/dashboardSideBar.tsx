"use client";

// components/Sidebar.js

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";

import api_client from "@/app/lib/utilities/api.client";
//import { deleteCookies } from "@/app/lib/utilities/cookies";
import { lang } from "@/app/lib/utilities/lang";
import { logOutUser } from "@/components/providers/store/user/user.store";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

const Sidebar = () => {
  const Links = [
    {
      href: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.home,
    },
    {
      href: "/dashboard/products",
      icon: <FaShoppingCart className="w-5 h-5" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.products,
    },
    {
      href: "/dashboard/users",
      icon: <FaUser className="w-5 h-5" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.users,
    },
    {
      href: "/dashboard/orders",
      icon: <FaShoppingCart className="w-5 h-5" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.orders,
    },
    {
      href: "/dashboard/reports",
      icon: <FaChartBar className="w-5 h-5" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.reports,
    },
    // {
    //   href: "/dashboard/settings",
    //   icon: <FaCog className="w-5 h-5" />,
    //   text: dashboardTranslate.layout.sidebar[lang].links.text.settings,
    // },
    // {
    //   href: "/logout",
    //   icon: <FaSignOutAlt className="w-5 h-5" />,
    //   text:dashboardTranslate.layout.sidebar[lang].links.text.logout,
    // },
  ];

  const [selectedLink, setSelectedLink] = useState(Links[0].href);
  const router = useRouter();
  const pathName = usePathname();
  const logout = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Logging out...");
      await logOutUser();
      //await deleteCookies("refreshAccessToken");

      await api_client.post("/auth/logout");

      toast.success("Logged out successfully");
    } catch (error: unknown) {
      toast.error(
        (error as Error).message ||
          dashboardTranslate.metadata[lang].errors.global
      );
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  useEffect(() => {
    setSelectedLink(pathName);
  }, [pathName, router]);
  return (
    <>
      {/* Mobile View: Select dropdown */}
      <div className="block md:hidden p-4 md:bg-gray-800 text-white rounded-lg">
        <label htmlFor="menu" className="text-lg font-semibold mb-2">
          {dashboardTranslate.layout.sidebar[lang].mobile.label}
        </label>
        <select
          id="menu"
          className="w-full p-3 border mt-2 rounded-lg bg-gray-50 text-gray-900"
          // className="w-full p-2 mt-2 text-gray-900 bg-white rounded"
          value={selectedLink}
          onChange={(e) => {
            setSelectedLink(e.target.value);
            router.push(e.target.value); // Redirect to selected page
          }}
        >
          {Links.map((link, index) => (
            <option key={index} value={link.href}>
              {link.text}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop View: Sidebar */}
      <aside className="hidden md:block min-w-[260px] max-w-[300px] bg-gray-800 text-white min-h-screen rounded-lg">
        {" "}
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-6">
            {dashboardTranslate.layout.sidebar[lang].desktop.label}
          </h1>
          <nav>
            <ul>
              {Links.map((link) => (
                <Fragment key={link.href}>
                  <li className="mb-4">
                    <Link
                      href={link.href}
                      className={`flex items-center justify-between p-3
                       text-gray-200 hover:bg-gray-700 rounded-lg
                        transition duration-150 ease-in-out ${
                          selectedLink === link.href ? "bg-gray-700" : ""
                        }`}
                    >
                      <p aria-label={link.text} className="flex items-center ">
                        {link.icon}
                        <span className="ml-4">{link.text}</span>
                      </p>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </li>
                </Fragment>
              ))}{" "}
              <li>
                <button
                  className="flex w-full items-center justify-between p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition duration-150 ease-in-out"
                  onClick={logout}
                >
                  <p className="flex items-center">
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="ml-4">
                      {
                        dashboardTranslate.layout.sidebar[lang].links.text
                          .logout
                      }
                    </span>
                  </p>
                  <svg
                    className="w-5 h-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
// components/Sidebar.js
// "use client";

// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { Fragment, useEffect, useState } from "react";
// import toast from "react-hot-toast";
// import {
//   FaChartBar,
//   FaHome,
//   FaShoppingCart,
//   FaSignOutAlt,
//   FaUser,
// } from "react-icons/fa";

// import api_client from "@/app/lib/utilities/api.client";
// import { lang } from "@/app/lib/utilities/lang";
// import { logOutUser } from "@/components/providers/store/user/user.store";
// import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

// const Sidebar = () => {
//   const Links = [
//     {
//       href: "/dashboard",
//       icon: <FaHome className="w-5 h-5" />,
//       text: dashboardTranslate.layout.sidebar[lang].links.text.home,
//     },
//     {
//       href: "/dashboard/products",
//       icon: <FaShoppingCart className="w-5 h-5" />,
//       text: dashboardTranslate.layout.sidebar[lang].links.text.products,
//     },
//     {
//       href: "/dashboard/users",
//       icon: <FaUser className="w-5 h-5" />,
//       text: dashboardTranslate.layout.sidebar[lang].links.text.users,
//     },
//     {
//       href: "/dashboard/orders",
//       icon: <FaShoppingCart className="w-5 h-5" />,
//       text: dashboardTranslate.layout.sidebar[lang].links.text.orders,
//     },
//     {
//       href: "/dashboard/reports",
//       icon: <FaChartBar className="w-5 h-5" />,
//       text: dashboardTranslate.layout.sidebar[lang].links.text.reports,
//     },
//   ];

//   const [selectedLink, setSelectedLink] = useState(Links[0].href);
//   const router = useRouter();
//   const pathName = usePathname();

//   const logout = async () => {
//     let toastLoading;
//     try {
//       toastLoading = toast.loading("Logging out...");
//       await logOutUser();
//       await api_client.post("/auth/logout");
//       toast.success("Logged out successfully");
//     } catch (error: unknown) {
//       toast.error(
//         (error as Error).message ||
//           dashboardTranslate.metadata[lang].errors.global
//       );
//     } finally {
//       toast.dismiss(toastLoading);
//     }
//   };

//   useEffect(() => {
//     setSelectedLink(pathName);
//   }, [pathName]);

//   return (
//     <>
//       {/* Mobile View: Select dropdown */}
//       <div className="block md:hidden p-4 bg-gray-800 text-white rounded-lg">
//         <label htmlFor="menu" className="text-lg font-semibold mb-2">
//           {dashboardTranslate.layout.sidebar[lang].mobile.label}
//         </label>
//         <select
//           id="menu"
//           className="w-full p-3 border mt-2 rounded-lg bg-gray-50 text-gray-900"
//           value={selectedLink}
//           onChange={(e) => {
//             setSelectedLink(e.target.value);
//             router.push(e.target.value);
//           }}
//         >
//           {Links.map((link, index) => (
//             <option key={index} value={link.href}>
//               {link.text}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Desktop View: Fixed Sidebar */}
//       <aside className="hidden md:block fixed top-0 left-0 min-w-[260px] max-w-[300px] bg-gray-800 text-white h-screen rounded-r-lg shadow-lg">
//         <div className="p-4 h-full overflow-y-auto">
//           <h1 className="text-2xl font-semibold mb-6">
//             {dashboardTranslate.layout.sidebar[lang].desktop.label}
//           </h1>
//           <nav>
//             <ul>
//               {Links.map((link) => (
//                 <Fragment key={link.href}>
//                   <li className="mb-4">
//                     <Link
//                       href={link.href}
//                       className={`flex items-center justify-between p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition duration-150 ease-in-out ${
//                         selectedLink === link.href ? "bg-gray-700" : ""
//                       }`}
//                     >
//                       <p aria-label={link.text} className="flex items-center">
//                         {link.icon}
//                         <span className="ml-4">{link.text}</span>
//                       </p>
//                       <svg
//                         className="w-5 h-5 text-gray-400"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M9 5l7 7-7 7"
//                         />
//                       </svg>
//                     </Link>
//                   </li>
//                 </Fragment>
//               ))}
//               <li>
//                 <button
//                   className="flex w-full items-center justify-between p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition duration-150 ease-in-out"
//                   onClick={logout}
//                 >
//                   <p className="flex items-center">
//                     <FaSignOutAlt className="w-5 h-5" />
//                     <span className="ml-4">
//                       {
//                         dashboardTranslate.layout.sidebar[lang].links.text
//                           .logout
//                       }
//                     </span>
//                   </p>
//                   <svg
//                     className="w-5 h-5 text-gray-400"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M9 5l7 7-7 7"
//                     />
//                   </svg>
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
