"use client";
import { useState } from "react";
import Link from "next/link";
import { AiOutlineShoppingCart } from "react-icons/ai";

import { VscAccount } from "react-icons/vsc";

// import CartDropdown from "../cart/cartDropdown";
import { useUser } from "../context/user.context";
import { useCartItems } from "../context/cart.context";
// import AccountNavList from "./account-navList";
import dynamic from "next/dynamic";
const AccountNavList = dynamic(() => import("./account-navList"));
const CartDropdown = dynamic(() => import("../cart/cartDropdown"));
const NavBar = () => {
  const { user } = useUser();
  const { isCartOpen, toggleCartStatus, setIsCartOpen, cartItems } =
    useCartItems(); // get the cartItemsCount from context
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const toggleCart = () => {
    toggleCartStatus();
  };

  // [
  //   { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
  //   { name: "Auth", icon: VscAccount, href: "/auth" },
  //   { name: "Cart", icon: AiOutlineShoppingCart, onClick: toggleCart },
  // ];

  return (
    <nav className="flex items-center justify-between bg-white shadow-lg -mx-2 -mt-2 sm:-mx-4 sm:-mt-4 p-3 sm:p-5">
      {/* Logo */}
      <Link href="/" className="flex items-center text-gray-800 mr-6">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </Link>

      {/* Main Navigation Links */}
      {/* <ul className="hidden md:flex flex-col md:flex-row justify-between mx-auto">
        {links.map((link, index) => (
          <li key={index} className="mx-2">
            <Link
              href={link.href || "#"}
              className="text-gray-800 font-medium text-lg hover:text-gray-600"
              onClick={link.onClick}
            >
              <span className="flex items-center">
                <link.icon className="mr-2" />
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul> */}

      {/* Account Dropdown */}
      <div
        className="relative text-gray-800"
        // onMouseLeave={() => setAccountMenuOpen(false)}
      >
        {/* Account Icon */}
        <div className="flex items-center cursor-pointer">
          <div
            className="flex items-center "
            onMouseEnter={() => setAccountMenuOpen(true)}
          >
            <VscAccount className="text-2xl" />
            <span className="ml-2">Account</span>
            <span className="hidden md:block  ml-2">Hi,</span>
          </div>
          <div
            className="relative flex items-center cursor-pointer shopping-cart"
            onClick={toggleCart}
          >
            <AiOutlineShoppingCart className="text-2xl text-gray-800 mx-3" />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItems.length}
              </span>
            )}
          </div>
        </div>

        {/* Dropdown Menu */}
        {accountMenuOpen && (
          <AccountNavList user={user} setAccountMenuOpen={setAccountMenuOpen} />
        )}
      </div>

      {/* Cart Icon with item count */}

      {/* Cart Dropdown */}
      {isCartOpen && (
        <CartDropdown
          toggleIsCartOpen={toggleCart}
          cartItems={cartItems}
          setIsCartOpen={setIsCartOpen}
        />
      )}
    </nav>
  );
};

// export default NavBarV4;

export default NavBar;
