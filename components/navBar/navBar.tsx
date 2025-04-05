'use client';

import Link from 'next/link';

import CartDropdown from '../cart/cartDropdown';
import {useCartItems} from '../providers/context/cart/cart.context';

import AccountDropdown from './ accountDropdown';

const NavBar = () => {
  const {isCartOpen, toggleCartStatus, setIsCartOpen, cartItems} = useCartItems(); // get the cartItemsCount from context

  const toggleCart = () => {
    toggleCartStatus();
  };

  return (
    <nav className="flex items-center justify-between bg-white shadow-lg -mx-2 -mt-2 sm:-mx-4 sm:-mt-4 p-3 sm:p-5">
      {/* Logo */}
      <Link href="/" className="flex items-center text-gray-800 mr-6">
        <span className="font-semibold text-xl tracking-tight">Logo</span>
      </Link>
      {/* Account Dropdown */}
      <AccountDropdown cartItems={cartItems} toggleCart={toggleCart} />
      {/* Cart Dropdown */}
      {isCartOpen ? <CartDropdown cartItems={cartItems} setIsCartOpen={setIsCartOpen} /> : null}
    </nav>
  );
};

export default NavBar;
