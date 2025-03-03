"use client";
import { useEffect, useRef, useState } from "react";
import { HiFilter, HiX } from "react-icons/hi";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import Pagination, { PaginationType } from "@/components/pagination/Pagination";
import ProductCard from "@/components/products/product-card/productCard";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { Event, ProductType } from "@/app/lib/types/products.types";
import SearchBar from "../ui/SearchBar";
import Filters from "../ui/Filters";

type ShopProps = {
  products: ProductType[];
  categories: string[];
  pagination: PaginationType;
};

const Shop = ({ products, categories, pagination }: ShopProps) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Query state management
  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString.withDefault("").withOptions({
      throttleMs: 500,
      shallow: false,
      //  scroll: false,
    })
  );
  // const [searchQuery, setSearchQuery] = useQueryState(
  //   "name",
  //   parseAsString.withDefault("").withOptions({
  //     throttleMs: 500,
  //     shallow: false,
  //     //  scroll: false,
  //   })
  // );

  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const [priceFilter, setPriceFilter] = useQueryState(
    "sort",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const [ratingFilter, setRatingFilter] = useQueryState(
    "rating",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const productsContainerRef = useRef<HTMLDivElement>(null);
  const handleCategoryFilterChange = (e: Event) => {
    const value = e.target.value;
    setCategoryFilter(value);
  };

  const handlePriceFilterChange = (e: Event) => {
    const value = e.target.value;
    setPriceFilter(value);
  };

  const handleRatingFilterChange = (e: Event) => {
    const value = e.target.value.toLowerCase();
    setRatingFilter(value);
  };

  const handleSearch = (e: Event) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const onPaginationChange = (page: number) => {
    setCurrentPage(page);
  };
  useEffect(() => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      window.scrollTo({ top: 10, behavior: "smooth" });
    }
  }, [searchQuery, categoryFilter, priceFilter, ratingFilter, currentPage]);
  return (
    <section className="flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        {shopPageTranslate[lang].shopPage.content.title}
      </h1>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsMobileFiltersOpen(true)}
        className="md:hidden flex items-center gap-2 p-3 bg-white rounded-lg shadow-md"
      >
        <HiFilter className="text-xl" />
        {shopPageTranslate[lang].shopPage.content.filters}
      </button>

      {/* Filter and Search Section */}
      <div className="hidden md:flex justify-between items-center gap-4 flex-wrap p-4 bg-white rounded-lg shadow-md">
        <Filters
          categories={categories}
          categoryFilter={categoryFilter}
          priceFilter={priceFilter}
          ratingFilter={ratingFilter}
          handleCategoryFilterChange={handleCategoryFilterChange}
          handlePriceFilterChange={handlePriceFilterChange}
          handleRatingFilterChange={handleRatingFilterChange}
        />

        {/* Search Section */}
        <SearchBar searchQuery={searchQuery} handleSearch={handleSearch} />
      </div>

      {/* Mobile Filters Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {shopPageTranslate[lang].shopPage.content.filters}
              </h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <HiX className="text-2xl" />
              </button>
            </div>

            <Filters
              categories={categories}
              categoryFilter={categoryFilter}
              priceFilter={priceFilter}
              ratingFilter={ratingFilter}
              handleCategoryFilterChange={handleCategoryFilterChange}
              handlePriceFilterChange={handlePriceFilterChange}
              handleRatingFilterChange={handleRatingFilterChange}
              isMobile
            />

            <SearchBar
              searchQuery={searchQuery}
              handleSearch={handleSearch}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div
        ref={productsContainerRef}
        className="h-screen md:h-[90dvh] overflow-y-auto"
      >
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> */}
        <div className="grid col gap-8">
          {products.map((product) => (
            <ProductCard key={product._id.toString()} product={product} />
          ))}
        </div>
      </div>

      <Pagination meta={pagination.meta} onPageChange={onPaginationChange} />
    </section>
  );
};

export default Shop;
