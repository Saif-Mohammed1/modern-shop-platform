import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import { Event } from "@/app/types/products.types";
import { FC } from "react";
import { lang } from "../util/lang";
import { HiOutlineSearch } from "react-icons/hi";

// Search Bar Component
type SearchBarProps = {
  searchQuery: string;
  handleSearch: (e: Event) => void;
  isMobile?: boolean;
};
const SearchBar: FC<SearchBarProps> = ({
  searchQuery,
  handleSearch,
  isMobile = false,
}) => (
  <div className={`${isMobile ? "mt-4" : ""} relative flex-grow max-w-[500px]`}>
    <input
      type="text"
      placeholder={
        shopPageTranslate[lang].shopPage.content.select.categoryFilter.label
      }
      value={searchQuery}
      onChange={handleSearch}
      className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 right-3 text-xl text-gray-400" />
  </div>
);
export default SearchBar;
