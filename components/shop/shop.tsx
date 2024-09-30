"use client";
import { useEffect, useRef, useState } from "react";
import { HiOutlineSearch } from "react-icons/hi";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import {
  Event,
  ProductType,
} from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import ProductCard from "@/components/products/product-card/productCard";
import { updateQueryParams } from "@/components/util/updateQueryParams";
import { shopPageTranslate } from "@/app/_translate/shop/shoppageTranslate";
import { lang } from "@/components/util/lang";
// import dynamic from "next/dynamic";
// const ProductCardV2 = dynamic(() =>
//   import("../products/product-card/productCard.jsx")
// );
// const Pagination = dynamic(() => import("../pagination/Pagination.jsx"));
type ShopProps = {
  products: ProductType[];
  categories: string[];
  totalPages: number;
};
const Shop = ({ products, categories, totalPages }: ShopProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  // const [categorySelected, setCategorySelected] = useState("");
  // const [priceSelected, setPriceSelected] = useState("");
  // const [ratingSelected, setRatingSelected] = useState("");
  const router = useRouter();
  const pathName = usePathname();
  const searchParamsReadOnly = useSearchParams();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  // const updateQueryParams = (params) => {
  //   const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
  //   for (const key in params) {
  //     if (params[key] === "") {
  //       paramsSearch.delete(key);
  //     } else {
  //       paramsSearch.set(key, params[key]);
  //     }
  //   }

  //   router.push(pathName + "?" + paramsSearch.toString());
  // };

  const handleCategoryFilterChange = (event: Event) => {
    const value = event.target.value;
    setCategoryFilter(value);
    updateQueryParams(
      { category: value },
      searchParamsReadOnly,
      router,
      pathName
    );
  };

  const handlePriceFilterChange = (event: Event) => {
    const value = event.target.value;
    setPriceFilter(value);
    updateQueryParams({ sort: value }, searchParamsReadOnly, router, pathName);
  };

  const handleRatingFilterChange = (event: Event) => {
    const value = event.target.value.toLowerCase();
    setRatingFilter(value);
    updateQueryParams(
      { rating: value },
      searchParamsReadOnly,
      router,
      pathName
    );
  };
  const handleSearch = (event: Event) => {
    const value = event.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateQueryParams(
        { name: value },
        searchParamsReadOnly,
        router,
        pathName
      );
    }, 1000); // Adjust the debounce delay as needed
  };

  const onPaginationChange = (page: number) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    setCurrentPage(page);

    if (page === 1) {
      paramsSearch.delete("page");
      router.push(pathName + "?" + paramsSearch.toString());
      return;
    }
    updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
  };

  useEffect(() => {
    if (searchParamsReadOnly.has("category")) {
      setCategoryFilter(searchParamsReadOnly.get("category") ?? "");
    }
    if (searchParamsReadOnly.has("price")) {
      setPriceFilter(searchParamsReadOnly.get("price") ?? "");
    }
    if (searchParamsReadOnly.has("rating")) {
      setRatingFilter(searchParamsReadOnly.get("rating") ?? "");
    }
    if (searchParamsReadOnly.has("page")) {
      if (Number(searchParamsReadOnly.get("page")) == 1) {
        const paramsSearch = new URLSearchParams(
          searchParamsReadOnly.toString()
        );

        paramsSearch.delete("page");
        router.push(pathName + "?" + paramsSearch.toString());
        setCurrentPage(1);
        return;
      }

      setCurrentPage(Number(searchParamsReadOnly.get("page")));
    }
  }, [searchParamsReadOnly.toString()]);
  return (
    <section className="flex flex-col gap-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800">
        {shopPageTranslate[lang].shopPage.content.title}
      </h1>
      {/* Filter and Search Section */}
      <div className="flex justify-between items-center gap-4 flex-wrap p-4 bg-white rounded-lg shadow-md">
        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="categoryFilter" className="text-gray-700 font-medium">
            {
              shopPageTranslate[lang].shopPage.content.select.categoryFilter
                .label
            }
            :
          </label>
          <select
            id="categoryFilter"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              {
                shopPageTranslate[lang].shopPage.content.select.categoryFilter
                  .all
              }
            </option>
            {/* Add more categories as options here */}
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          {/* Price Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="priceFilter" className="text-gray-700 font-medium">
              {
                shopPageTranslate[lang].shopPage.content.select.priceFilter
                  .label
              }
              :
            </label>
            <select
              id="priceFilter"
              value={priceFilter}
              onChange={handlePriceFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {
                  shopPageTranslate[lang].shopPage.content.select.priceFilter
                    .all
                }
              </option>
              <option value="price">
                {
                  shopPageTranslate[lang].shopPage.content.select.priceFilter
                    .lowestPrice
                }
              </option>
              <option value="-price">
                {
                  shopPageTranslate[lang].shopPage.content.select.priceFilter
                    .highestPrice
                }
              </option>
            </select>
          </div>

          {/* Rating Filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="ratingFilter" className="text-gray-700 font-medium">
              {
                shopPageTranslate[lang].shopPage.content.select.ratingFilter
                  .label
              }
              :
            </label>
            <select
              id="ratingFilter"
              value={ratingFilter}
              onChange={handleRatingFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">
                {
                  shopPageTranslate[lang].shopPage.content.select.ratingFilter
                    .all
                }
              </option>
              <option value="1">★☆☆☆☆</option>
              <option value="2">★★☆☆☆</option>
              <option value="3">★★★☆☆</option>
              <option value="4">★★★★☆</option>
              <option value="5">★★★★★</option>
            </select>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex items-center relative flex-grow max-w-[500px]">
          <div className="text-gray-400 absolute top-1/2 transform -translate-y-1/2 right-3 text-xl">
            <HiOutlineSearch />
          </div>
          <input
            type="text"
            placeholder="Search...."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className=" h-[90dvh] overflow-y-auto">
        <div className="grid col gap-8">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        onPageChange={onPaginationChange}
        totalPages={totalPages}
      />
    </section>
  );
};

export default Shop;
