import type { FC } from "react";

import type { Event } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";


import Select from "./Select";

type FiltersProps = {
  categories: string[];
  categoryFilter: string;
  priceFilter: string;
  ratingFilter: string;
  handleCategoryFilterChange: (e: Event) => void;
  handlePriceFilterChange: (e: Event) => void;
  handleRatingFilterChange: (e: Event) => void;
  isMobile?: boolean;
};

// type FilterSelectProps = {
//   id: string;
//   label: string;
//   value: string;
//   onChange: (e: Event) => void;
//   options: Array<{ value: string; label: string }>;
//   isMobile?: boolean;
// };

// Reusable Filters Component
const Filters: FC<FiltersProps> = ({
  categories,
  categoryFilter,
  priceFilter,
  ratingFilter,
  handleCategoryFilterChange,
  handlePriceFilterChange,
  handleRatingFilterChange,
  isMobile = false,
}) => (
  <div
    className={`flex ${isMobile ? "flex-col" : "items-center"} gap-4 w-full`}
  >
    <Select
      id="categoryFilter"
      label={
        shopPageTranslate[lang].shopPage.content.select.categoryFilter.label
      }
      value={categoryFilter}
      onChange={handleCategoryFilterChange}
      options={[
        {
          value: "",
          label:
            shopPageTranslate[lang].shopPage.content.select.categoryFilter.all,
        },
        ...categories.map((category) => ({ value: category, label: category })),
      ]}
      isMobile={isMobile}
    />

    <Select
      id="priceFilter"
      label={shopPageTranslate[lang].shopPage.content.select.priceFilter.label}
      value={priceFilter}
      onChange={handlePriceFilterChange}
      options={[
        {
          value: "",
          label:
            shopPageTranslate[lang].shopPage.content.select.priceFilter.all,
        },
        {
          value: "price",
          label:
            shopPageTranslate[lang].shopPage.content.select.priceFilter
              .lowestPrice,
        },
        {
          value: "-price",
          label:
            shopPageTranslate[lang].shopPage.content.select.priceFilter
              .highestPrice,
        },
      ]}
      isMobile={isMobile}
    />

    <Select
      id="ratingFilter"
      label={shopPageTranslate[lang].shopPage.content.select.ratingFilter.label}
      value={ratingFilter}
      onChange={handleRatingFilterChange}
      options={[
        {
          value: "",
          label:
            shopPageTranslate[lang].shopPage.content.select.ratingFilter.all,
        },
        { value: "4", label: "★★★★☆ & up" },
        { value: "3", label: "★★★☆☆ & up" },
        { value: "2", label: "★★☆☆☆ & up" },
        { value: "1", label: "★☆☆☆☆ & up" },
      ]}
      isMobile={isMobile}
    />
  </div>
);

// Enhanced FilterSelect Component
// const FilterSelect: FC<FilterSelectProps> = ({
//   id,
//   label,
//   value,
//   onChange,
//   options,
//   isMobile = false,
// }) => (
//   <div
//     className={`flex ${isMobile ? "flex-col" : "items-center gap-2"} w-full`}
//   >
//     <label
//       htmlFor={id}
//       className={`${isMobile ? "mb-2" : ""} text-gray-700 font-medium`}
//     >
//       {label}
//     </label>
//     <select
//       id={id}
//       value={value}
//       onChange={onChange}
//       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//     >
//       {options.map((option) => (
//         <option key={option.value} value={option.value}>
//           {option.label}
//         </option>
//       ))}
//     </select>
//   </div>
// );

export default Filters;
