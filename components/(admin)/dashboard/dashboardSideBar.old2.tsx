"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaHome,
  FaShoppingCart,
  FaSignOutAlt,
  FaUser,
  FaBars,
} from "react-icons/fa";

import api_client from "@/app/lib/utilities/api.client";
import { lang } from "@/app/lib/utilities/lang";
import { logOutUser } from "@/components/providers/store/user/user.store";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

const Sidebar: FC = () => {
  const pathName = usePathname();

  const [collapsed, setCollapsed] = useState(false);
  const [selectedLink, setSelectedLink] = useState(pathName);

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
  ];

  const logout = async () => {
    const toastLoading = toast.loading("Logging out...");
    try {
      await logOutUser();
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
  }, [pathName]);

  return (
    <aside
      className={`hidden md:flex flex-col bg-gray-800 text-white min-h-screen transition-all duration-300 ease-in-out ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      <div className="p-4 flex items-center justify-between">
        <h1
          className={`text-xl font-bold transition-opacity ${collapsed ? "opacity-0" : "opacity-100"}`}
        >
          {dashboardTranslate.layout.sidebar[lang].desktop.label}
        </h1>
        <button
          className="text-gray-300 hover:text-white"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <FaBars />
        </button>
      </div>

      <nav className="flex-1 p-2">
        <ul className="space-y-2">
          {Links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition ${
                  selectedLink === link.href ? "bg-gray-700" : ""
                }`}
              >
                {link.icon}
                {!collapsed && <span>{link.text}</span>}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 w-full text-left rounded-lg hover:bg-gray-700 transition"
            >
              <FaSignOutAlt className="w-5 h-5" />
              {!collapsed && (
                <span>
                  {dashboardTranslate.layout.sidebar[lang].links.text.logout}
                </span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
