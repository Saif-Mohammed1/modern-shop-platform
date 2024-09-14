"use client";
import { useContext, useState } from "react";
import Link from "next/link";
import {
  AiOutlineHome,
  AiOutlineInfoCircle,
  AiOutlineShoppingCart,
  AiOutlineUser,
} from "react-icons/ai";

import { RiContactsLine } from "react-icons/ri";
import { HiOutlineSearch } from "react-icons/hi";
import {
  VscAccount,
  VscSignIn,
  VscSignOut,
  VscPackage,
  VscChecklist,
  VscHeart,
} from "react-icons/vsc";

import CartDropdown from "../cart/cartDropdown";
import data from "../../data.js";
import { UserContext, useUser } from "../context/user.context";
import { CartContext, useCartItems } from "../context/cart.context";
import AccountNavList from "./account-navList";
const products = data.map((product, inx) => {
  product._id = inx;
  product.quantity = inx;
  return product;
});
const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const links = [
    { name: "Home", icon: AiOutlineHome, href: "/" },
    { name: "About", icon: AiOutlineInfoCircle, href: "/about" },
    { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
    { name: "Contact Us", icon: RiContactsLine, href: "/contact-us" },
    {
      name: "Cart",
      icon: AiOutlineShoppingCart,
      href: "/cart",
      onClick: toggleCart,
    },
    { name: "Auth", icon: AiOutlineUser, href: "/auth" },
  ];
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-800 -mx-4 -mt-4 p-5 ">
      <div className="flex items-center flex-shrink-0 text-white mr-6 bg-red">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </div>
      <div className="block lg:hidden bg-blue">
        <button
          className="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
          type="button"
        >
          <svg
            className="fill-current h-3 w-3"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      {/* <div className="flex flex-col md:flex-row items-center justify-between bg-green flex-grow"> */}
      <ul className="flex flex-col md:flex-row justify-between bg-red mx-auto ">
        {links.map((link, index) => (
          <li key={index} className="mx-2">
            <Link
              href={link.href}
              className=" text-white font-medium text-lg hover:text-gray-300 "
            >
              <span className="flex items-center">
                <link.icon className="mr-1" />
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {/* </div> */}
    </nav>
  );
};

// Import cart icon CartDropdown

const NavBarV2 = () => {
  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const links = [
    { name: "Home", icon: AiOutlineHome, href: "/" },
    { name: "About", icon: AiOutlineInfoCircle, href: "/about" },
    { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
    { name: "Contact Us", icon: RiContactsLine, href: "/contact-us" },
    {
      name: "Cart",
      icon: AiOutlineShoppingCart,
      href: "/cart",
      onClick: toggleCart,
    },
    { name: "Auth", icon: AiOutlineUser, href: "/auth" },
  ];

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <nav className="flex items-center justify-between bg-gray-800 p-4">
      {/* Logo */}
      <div className="flex items-center text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </div>

      {/* Mobile Menu Button */}
      <div className="block lg:hidden">
        <button
          className="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
          type="button"
        >
          <svg
            className="fill-current h-5 w-5"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>

      {/* Navigation Links */}
      <div className="w-full flex-grow lg:flex lg:items-center lg:w-auto">
        <ul className="flex flex-col lg:flex-row justify-center items-center mx-auto space-y-2 lg:space-y-0 lg:space-x-6">
          {links.map((link, index) => (
            <li key={index} className="mx-2">
              <Link
                href={link.href}
                className="text-white font-medium text-lg hover:text-gray-300"
                onClick={link.onClick}
              >
                <span className="flex items-center">
                  <link.icon className="mr-2" />
                  {link.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Search Bar */}
        <div className="relative flex items-center mt-4 lg:mt-0">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearch}
            className="w-full lg:w-64 px-4 py-2 pl-10 rounded-md border border-gray-600 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <HiOutlineSearch className="absolute left-3 text-gray-400 text-xl" />
        </div>
      </div>
    </nav>
  );
};

const NavBarV3 = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useContext(UserContext);

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const [searchQuery, setSearchQuery] = useState("");
  const links = [
    // { name: "Home", icon: AiOutlineHome, href: "/" },
    { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
    {
      name: "Auth",
      icon: VscAccount,
      //AiOutlineUser
      href: "/auth",
    },
    { name: "Cart", icon: AiOutlineShoppingCart, onClick: toggleCart },
  ];

  return (
    <nav className="flex items-center justify-between bg-gray-800 /p-4 -mx-4 -mt-4 p-5">
      {/* Logo */}
      <div className="flex items-center text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </div>
      {/* Mobile Menu Button */}
      <div className="block md:hidden ">
        <button
          className="flex items-center px-3 py-2 border rounded text-gray-200 border-gray-400 hover:text-white hover:border-white"
          type="button"
        >
          <svg
            className="fill-current h-5 w-5"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <ul className="hidden md:flex /flex-col md:flex-row justify-between bg-red mx-auto ">
        {links.map((link, index) => (
          <li key={index} className="mx-2">
            <Link
              href={link.href || "#"}
              className="text-white font-medium text-lg hover:text-gray-300"
              onClick={link.onClick}
            >
              <span className="flex items-center">
                <link.icon className="mr-2" />
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {isOpen && <CartDropdown cartItems={products} />}
    </nav>
  );
};

const NavBarV4 = () => {
  const { user } = useContext(UserContext);
  const { isCartOpen, toggleCartStatus } = useContext(CartContext);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false); // state to handle account hover

  const toggleCart = () => {
    toggleCartStatus();
  };

  const links = [
    { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
    { name: "Auth", icon: VscAccount, href: "/auth" },
    { name: "Cart", icon: AiOutlineShoppingCart, onClick: toggleCart },
  ];

  return (
    <nav className="flex items-center justify-between /bg-gray-800 bg-white shadow-lg -mx-4 -mt-4 p-5">
      {/* Logo */}
      <Link href="/" className="flex items-center text-white mr-6">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </Link>

      {/* Main Navigation Links */}
      <ul className="hidden md:flex flex-col md:flex-row justify-between mx-auto">
        {links.map((link, index) => (
          <li key={index} className="mx-2">
            <Link
              href={link.href || "#"}
              className="text-white font-medium text-lg hover:text-gray-300"
              onClick={link.onClick}
            >
              <span className="flex items-center">
                <link.icon className="mr-2" />
                {link.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Account Dropdown */}
      <div
        className="relative text-white"
        onMouseEnter={() => setAccountMenuOpen(true)}
        // onMouseLeave={() => setAccountMenuOpen(false)}
      >
        {/* Account Icon */}
        <div className="flex items-center cursor-pointer">
          <VscAccount className="text-2xl" />
          <span className="ml-2">Account</span>
        </div>

        {/* Dropdown Menu */}
        {accountMenuOpen && (
          <div
            className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-lg py-2 text-gray-800 z-50"
            onMouseEnter={() => setAccountMenuOpen(true)}
            onMouseLeave={() => setAccountMenuOpen(false)}
          >
            {/* Welcome */}
            <div className="px-4 py-2 font-bold text-black border-b border-gray-300">
              {user ? `Welcome, ${user.name}` : "Welcome"}
            </div>
            {/* Dropdown Links with icons and bottom borders */}
            {user && (
              <Link href="/my-account/">
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
            <Link href="/orders">
              <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
                <VscPackage className="mr-2" /> Your Orders
              </span>
            </Link>
            <Link href="/track-order">
              <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
                <VscChecklist className="mr-2" /> Track Order
              </span>
            </Link>
            <Link href="/wishlist">
              <span className="flex items-center px-4 py-2 hover:bg-gray-200">
                <VscHeart className="mr-2" /> Your Wishlist
              </span>
            </Link>
            {user && (
              <span className="flex items-center px-4 py-2 hover:bg-gray-200 border-b border-gray-300">
                <VscSignOut className="mr-2" /> Log Out
              </span>
            )}
          </div>
        )}
      </div>

      {/* Cart Dropdown */}
      {isCartOpen && <CartDropdown />}
    </nav>
  );
};

const NavBarV5 = () => {
  const { user } = useUser();
  const { isCartOpen, toggleCartStatus, cartItems } = useCartItems(); // get the cartItemsCount from context
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  console.log("user NavBarV5", user);

  const toggleCart = () => {
    toggleCartStatus();
  };

  const links = [];
  // [
  //   { name: "Shop", icon: AiOutlineShoppingCart, href: "/shop" },
  //   { name: "Auth", icon: VscAccount, href: "/auth" },
  //   { name: "Cart", icon: AiOutlineShoppingCart, onClick: toggleCart },
  // ];

  return (
    <nav className="flex items-center justify-between bg-white shadow-lg  -mx-4 -mt-4 p-5">
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
            className="relative flex items-center cursor-pointer"
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
        <CartDropdown toggleIsCartOpen={toggleCart} cartItems={cartItems} />
      )}
    </nav>
  );
};

// export default NavBarV4;

export default NavBarV5;
