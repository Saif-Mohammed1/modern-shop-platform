"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaCog,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

import api_client from "@/app/lib/utilities/api.client";
import { lang } from "@/app/lib/utilities/lang";
import { logOutUser } from "@/components/providers/store/user/user.store";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  // const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const pathName = usePathname();

  // Load sidebar state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const Links = [
    {
      href: "/dashboard",
      icon: <FaHome className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.home,
    },
    {
      href: "/dashboard/products",
      icon: <FaShoppingCart className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.products,
    },
    {
      href: "/dashboard/users",
      icon: <FaUser className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.users,
    },
    {
      href: "/dashboard/orders",
      icon: <FaShoppingCart className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.orders,
    },
    {
      href: "/dashboard/reports",
      icon: <FaChartBar className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.reports,
    },
    {
      href: "/dashboard/settings",
      icon: <FaCog className="w-5 h-5 flex-shrink-0" />,
      text: dashboardTranslate.layout.sidebar[lang].links.text.settings,
    },
  ];

  const logout = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Logging out...");
      await logOutUser();
      await api_client.post("/auth/logout");
      toast.success("Logged out successfully");
      router.push("/login");
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
  }, [pathName]);

  // const shouldShowText = isHovered || !isCollapsed;
  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return (
    <div className="flex flex-col md:flex-row gap-2">
      {" "}
      {/* Mobile View: Select dropdown */}
      <div className="block md:hidden p-4 bg-gray-800 text-white rounded-lg mb-4">
        <label htmlFor="menu" className="text-lg font-semibold mb-2">
          {dashboardTranslate.layout.sidebar[lang].mobile.label}
        </label>
        <select
          id="menu"
          className="w-full p-3 border mt-2 rounded-lg bg-gray-700 text-white"
          value={selectedLink}
          onChange={(e) => router.push(e.target.value)}
        >
          {Links.map((link, index) => (
            <option key={index} value={link.href}>
              {link.text}
            </option>
          ))}
        </select>
      </div>
      {/* Desktop View: Sidebar */}
      <aside
        className={`hidden md:block ${sidebarWidth} bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out fixed left-0 top-0 bottom-0 z-10`}
        // className={`hidden md:flex ${sidebarWidth} flex-shrink-0 bg-gray-800 text-white transition-all duration-300`}
      >
        <div
          className="p-4 h-full flex flex-col bg-red"
          // onMouseEnter={() => setIsHovered(true)}
          // onMouseLeave={() => setIsHovered(false)}
        >
          {/* Collapse button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-6 bg-gray-800 text-white p-1 rounded-full border border-gray-600 shadow-lg hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <FaChevronRight size={14} />
            ) : (
              <FaChevronLeft size={14} />
            )}
          </button>

          {/* Logo/Title */}
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-8 pt-4`}
          >
            {!isCollapsed && (
              <h1 className="text-xl font-bold truncate">
                {dashboardTranslate.layout.sidebar[lang].desktop.label}
              </h1>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="flex-1">
            <ul className="space-y-1">
              {Links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors ${
                      selectedLink === link.href ? "bg-gray-700" : ""
                    } ${isCollapsed ? "justify-center" : ""}`}
                    title={link.text}
                  >
                    {link.icon}
                    {!isCollapsed && (
                      <span className="ml-3 truncate">{link.text}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button
              className={`flex items-center w-full p-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors ${
                isCollapsed ? "justify-center" : ""
              }`}
              onClick={logout}
              title={dashboardTranslate.layout.sidebar[lang].links.text.logout}
            >
              <FaSignOutAlt className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="ml-3 truncate">
                  {dashboardTranslate.layout.sidebar[lang].links.text.logout}
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
