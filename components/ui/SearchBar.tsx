import type { Event } from "@/app/lib/types/products.types";
import type { FC } from "react";
import { HiOutlineSearch } from "react-icons/hi";

// Search Bar Component
type SearchBarProps = {
  searchQuery: string;
  handleSearch: (e: Event) => void;
  placeholder?: string;
  isMobile?: boolean;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;
const SearchBar: FC<SearchBarProps> = ({
  searchQuery,
  placeholder,
  handleSearch,
  isMobile = false,
  className = "",
  ...props
}) => (
  <div
    className={`${isMobile ? "mt-4" : ""} relative flex-grow max-w-[500px] ${className}`}
  >
    <input
      {...props}
      type="text"
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleSearch}
      className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <HiOutlineSearch className="absolute top-1/2 -translate-y-1/2 right-3 text-xl text-gray-400" />
  </div>
);
export default SearchBar;
