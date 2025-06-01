"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { MdDashboard } from "react-icons/md";
import {
  VscAccount,
  VscHeart,
  VscPackage,
  VscSignIn,
  VscSignOut,
} from "react-icons/vsc";

import {
  allowedRoles,
  type UserAuthType,
} from "@/app/lib/types/users.db.types";
import api_client from "@/app/lib/utilities/api.client";
//import { deleteCookies } from "@/app/lib/utilities/cookies";
import { lang } from "@/app/lib/utilities/lang";
import { navBarTranslate } from "@/public/locales/client/(public)/navBarTranslate";

import { logOutUser } from "../providers/store/user/user.store";
import CustomLink from "../ui/CustomLink";

type AccountNavListProps = {
  user: UserAuthType | null;
  setAccountMenuOpen: (open: boolean) => void;
};
const AccountNavList = ({ user, setAccountMenuOpen }: AccountNavListProps) => {
  const navListRef = useRef<HTMLDivElement | null>(null);
  const logOut = async () => {
    try {
      await logOutUser();
      toast.success(
        navBarTranslate[lang].accountNavList.functions.logOut.success
      );
      //await deleteCookies("refreshAccessToken");
      await api_client.post("/auth/logout");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Error logging out";

      toast.error(errorMessage);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        navListRef.current &&
        !navListRef.current.contains(event.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setAccountMenuOpen]);
  return (
    <div
      ref={navListRef}
      className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 text-gray-800 z-50"
      onMouseEnter={() => {
        setAccountMenuOpen(true);
      }}
      onMouseLeave={() => {
        setAccountMenuOpen(false);
      }}
    >
      {/* Welcome */}
      <div className="px-4 py-2 font-bold text-black border-b border-gray-300">
        {user
          ? `${
              navBarTranslate[lang].accountNavList.content.accountMenu.welcome
            }, ${user.name.split(" ")[0]}`
          : navBarTranslate[lang].accountNavList.content.accountMenu.welcome}
      </div>
      {user && allowedRoles.includes(user.role) ? (
        <Link href="/dashboard">
          <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
            <MdDashboard className="mr-2" />{" "}
            {
              navBarTranslate[lang].accountNavList.content.accountMenu
                .adminDashboard
            }
          </span>
        </Link>
      ) : null}
      {/* Dropdown Links with icons and bottom borders */}
      {user ? (
        <Link href="/account/dashboard">
          <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
            <VscAccount className="mr-2" />{" "}
            {navBarTranslate[lang].accountNavList.content.accountMenu.myAccount}
          </span>
        </Link>
      ) : null}
      {!user && (
        <>
          <CustomLink href="/auth/" className="hidden md:block">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignIn className="mr-2" />{" "}
              {navBarTranslate[lang].accountNavList.content.accountMenu.signIn}
            </span>
          </CustomLink>
          <CustomLink
            href="/auth/"
            intercept={false}
            className="block md:hidden"
          >
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignIn className="mr-2" />{" "}
              {navBarTranslate[lang].accountNavList.content.accountMenu.signIn}
            </span>
          </CustomLink>
          <CustomLink href="/auth/register" className="hidden md:block">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignOut className="mr-2" />
              {
                navBarTranslate[lang].accountNavList.content.accountMenu
                  .createAccount
              }
            </span>
          </CustomLink>
          <CustomLink
            href="/auth/register"
            intercept={false}
            className="block md:hidden"
          >
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscSignOut className="mr-2" />
              {
                navBarTranslate[lang].accountNavList.content.accountMenu
                  .createAccount
              }
            </span>
          </CustomLink>
        </>
      )}
      <Link href="/shop">
        <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
          <AiOutlineShoppingCart className="mr-2" />

          {navBarTranslate[lang].accountNavList.content.accountMenu.shop}
        </span>
      </Link>
      {/* <Link href="/account/track-order">
        <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
          <VscChecklist className="mr-2" /> Track Order
        </span>
      </Link> */}
      {user ? (
        <>
          <Link href="/account/orders/">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscPackage className="mr-2" />{" "}
              {
                navBarTranslate[lang].accountNavList.content.accountMenu
                  .yourOrders
              }
            </span>
          </Link>

          <Link href="/account/wishlist">
            <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
              <VscHeart className="mr-2" />{" "}
              {
                navBarTranslate[lang].accountNavList.content.accountMenu
                  .yourWishlist
              }
            </span>
          </Link>

          <button
            className="flex w-full items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300 cursor-pointer"
            onClick={logOut}
          >
            <VscSignOut className="mr-2" />
            {navBarTranslate[lang].accountNavList.content.accountMenu.logOut}
          </button>
        </>
      ) : null}
    </div>
  );
};

export default AccountNavList;
