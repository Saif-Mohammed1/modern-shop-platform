// components/AccountMenu.js
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaTachometerAlt,
  FaUser,
  FaHeart,
  FaAddressBook,
  FaStar,
  FaListAlt,
  FaEnvelope,
  FaCreditCard,
  FaLock,
  FaTicketAlt,
  FaSignOutAlt,
  FaTrash,
} from "react-icons/fa";

const AccountMenu = () => {
  // const accountOptions = [
  //   { label: "Account Dashboard", href: "/account/dashboard" },
  //   { label: "Account Information", href: "/account/information" },
  //   { label: "My Wishlist", href: "/account/wishlist" },
  //   { label: "Address Book", href: "/account/address-book" },
  //   { label: "My Product Reviews", href: "/account/reviews" },
  //   { label: "My</h1> Orders", href: "/account/orders" },
  //   { label: "Newsletter Subscriptions", href: "/account/newsletter" },
  //   { label: "Payment Methods", href: "/account/payment-methods" },
  //   { label: "Privacy Settings", href: "/account/privacy" },
  //   { label: "My Tickets", href: "/account/tickets" },
  //   { label: "Log Out", href: "/account/logout" },
  //   { label: "Delete Account", href: "/account/delete" },
  // ];
  const accountOptions = [
    {
      label: "Account Dashboard",
      href: "/account/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Account Information",
      href: "/account/settings",
      icon: <FaUser />,
    },
    { label: "My Wishlist", href: "/account/wishlist", icon: <FaHeart /> },
    {
      label: "Address Book",
      href: "/account/address-book",
      icon: <FaAddressBook />,
    },
    { label: "My Product Reviews", href: "/account/reviews", icon: <FaStar /> },
    { label: "My Orders", href: "/account/orders", icon: <FaListAlt /> },
    {
      label: "Newsletter Subscriptions",
      href: "/account/newsletter",
      icon: <FaEnvelope />,
    },
    {
      label: "Payment Methods",
      href: "/account/payment-methods",
      icon: <FaCreditCard />,
    },
    { label: "Privacy Settings", href: "/account/privacy", icon: <FaLock /> },
    { label: "My Tickets", href: "/account/tickets", icon: <FaTicketAlt /> },
    { label: "Log Out", href: "/account/logout", icon: <FaSignOutAlt /> },
    { label: "Delete Account", href: "/account/delete", icon: <FaTrash /> },
  ];
  return (
    <div className="/max-w-4xl min-w-[300px] /mx-auto bg-white shadow-md rounded-lg p-2">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Customer Account
      </h1>
      <ul className="space-y-4">
        {accountOptions.map((option, index) => (
          <li key={index}>
            <Link
              href={option.href}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg shadow"
            >
              <p className="text-base font-normal text-gray-500 flex space-x-2 items-center justify-center ">
                {option.icon}
                <span>{option.label}</span>
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
        ))}
      </ul>
    </div>
  );
};

const AccountMenuV2 = () => {
  const router = useRouter();
  const pathName = usePathname();
  const [selectedOption, setSelectedOption] = useState("/account/dashboard");

  const accountOptions = [
    {
      label: "Account Dashboard",
      href: "/account/dashboard",
      icon: <FaTachometerAlt />,
    },
    {
      label: "Account Settings",
      //Information",
      href: "/account/settings",
      icon: <FaUser />,
    },
    { label: "My Wishlist", href: "/account/wishlist", icon: <FaHeart /> },
    {
      label: "Address Book",
      href: "/account/address",
      icon: <FaAddressBook />,
    },
    { label: "My Product Reviews", href: "/account/reviews", icon: <FaStar /> },
    { label: "My Orders", href: "/account/orders", icon: <FaListAlt /> },
    // {
    //   label: "Newsletter Subscriptions",
    //   href: "/account/newsletter",
    //   icon: <FaEnvelope />,
    // },
    // {
    //   label: "Payment Methods",
    //   href: "/account/payment-methods",
    //   icon: <FaCreditCard />,
    // },
    // { label: "Privacy Settings", href: "/account/privacy", icon: <FaLock /> },
    { label: "My Tickets", href: "/account/tickets", icon: <FaTicketAlt /> },
    // { label: "Log Out", href: "/account/logout", icon: <FaSignOutAlt /> },
    // { label: "Delete Account", href: "/account/delete", icon: <FaTrash /> },
  ];

  const handleNavigation = (event) => {
    const selectedValue = event.target.value;
    setSelectedOption(selectedValue);
    if (selectedValue) {
      router.push(selectedValue);
    }
  };

  useEffect(() => {
    setSelectedOption(pathName);
  }, [pathName, router]);
  return (
    <div className="w-full sm:max-w-[300px] bg-white shadow-md rounded-lg p-2">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Customer Account
      </h1>

      {/* Dropdown selector for small screens */}
      <div className="block sm:hidden mb-6">
        <select
          value={selectedOption}
          onChange={handleNavigation}
          className="w-full p-3 border rounded-lg bg-gray-50 text-gray-600"
        >
          <option value="">Select an Option</option>
          {accountOptions.map((option) => (
            <option key={option.label} value={option.href}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* List view for larger screens */}
      <ul className="hidden sm:block space-y-4">
        {accountOptions.map((option, index) => {
          const isActive = pathName === option.href;

          return (
            <li key={option.href}>
              <Link
                href={option.href}
                className={`flex items-center justify-between p-4 rounded-lg shadow ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-500"
                }`}
              >
                <p className="text-base font-normal text-gray-500 flex space-x-2 items-center justify-center ">
                  {option.icon}
                  <span>{option.label}</span>
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
          );
        })}
      </ul>
    </div>
  );
};

export default AccountMenuV2;
