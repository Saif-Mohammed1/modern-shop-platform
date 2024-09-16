"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import {
  VscAccount,
  VscSignIn,
  VscSignOut,
  VscPackage,
  VscChecklist,
  VscHeart,
} from "react-icons/vsc";
import { MdDashboard } from "react-icons/md";
import api from "../util/axios.api";

const AccountNavList = ({ user, setAccountMenuOpen }) => {
  const logOut = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      await api.post("/auth/logout");
    } catch (error) {
      toast.error("Error logging out", error);
    }
  };
  return (
    <div
      className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 text-gray-800 z-50"
      onMouseEnter={() => setAccountMenuOpen(true)}
      onMouseLeave={() => setAccountMenuOpen(false)}
    >
      {/* Welcome */}
      <div className="px-4 py-2 font-bold text-black border-b border-gray-300">
        {user ? `Welcome, ${user.name}` : "Welcome"}
      </div>
      {user && user.role === "admin" && (
        <Link href="/dashboard">
          <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
            <MdDashboard className="mr-2" /> Admin Dashboard
          </span>
        </Link>
      )}
      {/* Dropdown Links with icons and bottom borders */}
      {user && (
        <Link href="/account/dashboard">
          <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
            <VscAccount className="mr-2" /> My Account
          </span>
        </Link>
      )}
      {!user && (
        <>
          <Link href="/auth/">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignIn className="mr-2" /> Sign In
            </span>
          </Link>
          <Link href="/auth/register">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignOut className="mr-2" /> Create an Account
            </span>
          </Link>
        </>
      )}
      <Link href="/shop">
        <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
          <AiOutlineShoppingCart className="mr-2" />
          Shop
        </span>
      </Link>
      {/* <Link href="/account/track-order">
        <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
          <VscChecklist className="mr-2" /> Track Order
        </span>
      </Link> */}
      {user && (
        <Link href="/account/orders/">
          <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
            <VscPackage className="mr-2" /> Your Orders
          </span>
        </Link>
      )}
      <Link href="/account/wishlist">
        <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
          <VscHeart className="mr-2" /> Your Wishlist
        </span>
      </Link>
      {user && (
        <span
          className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300 cursor-pointer"
          onClick={logOut}
        >
          <VscSignOut className="mr-2" /> Log Out
        </span>
      )}
    </div>
  );
};

export default AccountNavList;
