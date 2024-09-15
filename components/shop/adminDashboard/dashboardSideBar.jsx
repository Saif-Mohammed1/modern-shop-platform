"use client";
import api from "@/components/util/axios.api";
import { signOut } from "next-auth/react";
// components/Sidebar.js
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
// import { useState } from "react";
// import { useRouter } from "next/navigation";

import {
  FaHome,
  FaUser,
  FaShoppingCart,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar = (req) => {
  //console.log(req);
  return (
    <aside className="w-64 h-screen bg-gray-800 text-white">
      <div className="p-4">
        <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
        <nav>
          <ul>
            <li className="mb-2">
              <Link
                href="/dashboard"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <HomeIcon className="w-6 h-6 mr-3" />
                <span>Home</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/products"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <ShoppingCartIcon className="w-6 h-6 mr-3" />
                <span>Products</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/users"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <UserIcon className="w-6 h-6 mr-3" />
                <span>Users</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/orders"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <ShoppingCartIcon className="w-6 h-6 mr-3" />
                <span>Orders</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/reports"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <ChartBarIcon className="w-6 h-6 mr-3" />
                <span>Reports</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/settings"
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
              >
                <CogIcon className="w-6 h-6 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <button
                onClick={() => alert("Are you sure you want to log out?")}
                className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition w-full text-left"
              >
                <XCircleIcon className="w-6 h-6 mr-3" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

const SidebarV2 = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleNavigation = (path) => {
    router.push(path);
    if (isOpen) setIsOpen(false);
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-transform ${
        isOpen ? "w-64" : "w-16"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <span className="text-xl font-bold">Dashboard</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white"
        >
          <XCircleIcon className="h-6 w-6" />
        </button>
      </div>
      <nav className="mt-6">
        <ul>
          <li
            onClick={() => handleNavigation("/")}
            className="cursor-pointer p-4 hover:bg-gray-700 transition-colors"
          >
            <HomeIcon className="h-6 w-6 inline mr-3" />
            {isOpen && <span>Home</span>}
          </li>
          <li
            onClick={() => handleNavigation("/users")}
            className="cursor-pointer p-4 hover:bg-gray-700 transition-colors"
          >
            <UserIcon className="h-6 w-6 inline mr-3" />
            {isOpen && <span>Users</span>}
          </li>
          <li
            onClick={() => handleNavigation("/products")}
            className="cursor-pointer p-4 hover:bg-gray-700 transition-colors"
          >
            <ShoppingCartIcon className="h-6 w-6 inline mr-3" />
            {isOpen && <span>Products</span>}
          </li>
          <li
            onClick={() => handleNavigation("/reports")}
            className="cursor-pointer p-4 hover:bg-gray-700 transition-colors"
          >
            <ChartBarIcon className="h-6 w-6 inline mr-3" />
            {isOpen && <span>Reports</span>}
          </li>
          <li
            onClick={() => handleNavigation("/settings")}
            className="cursor-pointer p-4 hover:bg-gray-700 transition-colors"
          >
            <CogIcon className="h-6 w-6 inline mr-3" />
            {isOpen && <span>Settings</span>}
          </li>
        </ul>
      </nav>
    </div>
  );
};

// const SidebarV3 = () => {
//   const Links = [
//     {
//       href: "/dashboard",
//       icon: <FaHome className="w-6 h-6 mr-3" />,
//       text: "Home",
//     },
//     {
//       href: "/dashboard/products",
//       icon: <FaShoppingCart className="w-6 h-6 mr-3" />,
//       text: "Products",
//     },
//     {
//       href: "/dashboard/users",
//       icon: <FaUser className="w-6 h-6 mr-3" />,
//       text: "Users",
//     },
//     {
//       href: "/dashboard/orders",
//       icon: <FaShoppingCart className="w-6 h-6 mr-3" />,
//       text: "Orders",
//     },
//     {
//       href: "/dashboard/reports",
//       icon: <FaChartBar className="w-6 h-6 mr-3" />,
//       text: "Reports",
//     },
//     {
//       href: "/dashboard/settings",
//       icon: <FaCog className="w-6 h-6 mr-3" />,
//       text: "Settings",
//     },
//     {
//       href: "/logout",
//       icon: <FaSignOutAlt className="w-6 h-6 mr-3" />,
//       text: "Logout",
//     },
//   ];
//   return (
//     <aside className=" min-w-[260px] max-w-[300px] min-h-screen bg-gray-800 text-white">
//       <div className="p-4">
//         <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
//         <nav>
//           <ul>
//             {Links.map((link, index) => (
//               <li key={index} className="mb-2">
//                 <Link
//                   href={link.href}
//                   className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition"
//                 >
//                   <p className="text-base font-normal text-gray-500 flex space-x-2 items-center justify-center ">
//                     {link.icon}
//                     <span>{link.label}</span>
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
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div>
//     </aside>
//   );
// };

const SidebarV3 = () => {
  const Links = [
    {
      href: "/dashboard",
      icon: <FaHome className="w-5 h-5" />,
      text: "Home",
    },
    {
      href: "/dashboard/products",
      icon: <FaShoppingCart className="w-5 h-5" />,
      text: "Products",
    },
    {
      href: "/dashboard/users",
      icon: <FaUser className="w-5 h-5" />,
      text: "Users",
    },
    {
      href: "/dashboard/orders",
      icon: <FaShoppingCart className="w-5 h-5" />,
      text: "Orders",
    },
    {
      href: "/dashboard/reports",
      icon: <FaChartBar className="w-5 h-5" />,
      text: "Reports",
    },
    // {
    //   href: "/dashboard/settings",
    //   icon: <FaCog className="w-5 h-5" />,
    //   text: "Settings",
    // },
    // {
    //   href: "/logout",
    //   icon: <FaSignOutAlt className="w-5 h-5" />,
    //   text: "Logout",
    // },
  ];

  const [selectedLink, setSelectedLink] = useState(Links[0].href);
  const router = useRouter();
  const pathName = usePathname();
  const logout = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Logging out...");
      await signOut();
      await api.post("/auth/logout");

      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
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
          Navigation
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
      <aside className="hidden md:block min-w-[260px] max-w-[300px] bg-gray-800 text-white min-h-screen">
        <div className="p-4">
          <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>
          <nav>
            <ul>
              {Links.map((link, index) => (
                <>
                  <li key={index} className="mb-4">
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
                </>
              ))}{" "}
              <li>
                <button
                  className="flex w-full items-center justify-between p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition duration-150 ease-in-out"
                  onClick={logout}
                >
                  <p className="flex items-center">
                    <FaSignOutAlt className="w-5 h-5" />
                    <span className="ml-4">Logout</span>
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

export default SidebarV3;
