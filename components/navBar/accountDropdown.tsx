import { type FC, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { VscAccount } from "react-icons/vsc";

import { type CartItemsType } from "@/app/lib/types/cart.types";
import { lang } from "@/app/lib/utilities/lang";
import { navBarTranslate } from "@/public/locales/client/(public)/navBarTranslate";

import { useUserStore } from "../providers/store/user/user.store";

import AccountNavList from "./account-navList";

type Props = {
  cartItems: CartItemsType[];
  toggleCart: () => void;
};
const AccountDropdown: FC<Props> = ({ cartItems, toggleCart }) => {
  const user = useUserStore((state) => state.user);

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <>
      {/* Account Dropdown */}
      <div
        className="relative text-gray-800"
        // onMouseLeave={() => setAccountMenuOpen(false)}
      >
        {/* Account Icon */}
        <div className="flex items-center cursor-pointer">
          <div
            className="flex items-center "
            onMouseEnter={() => {
              setAccountMenuOpen(true);
            }}
          >
            <VscAccount className="text-2xl" />
            <span className="ml-2">{navBarTranslate[lang].navBar.account}</span>
            <span className="hidden md:block  ml-2">
              {navBarTranslate[lang].navBar.hi},
            </span>
          </div>

          <button
            className="relative flex items-center cursor-pointer shopping-cart"
            onClick={toggleCart}
          >
            <AiOutlineShoppingCart className="text-2xl text-gray-800 mx-3" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-2 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItems?.length}
              </span>
            )}
          </button>
        </div>

        {/* Dropdown Menu */}
        {accountMenuOpen ? (
          <AccountNavList user={user} setAccountMenuOpen={setAccountMenuOpen} />
        ) : null}
      </div>
    </>
  );
};

export default AccountDropdown;
