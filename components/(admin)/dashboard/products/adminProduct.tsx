"use client";

import { gql, useMutation } from "@apollo/client";
import { DateTime } from "luxon";
import Image from "next/image";
import Link from "next/link";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { type FC, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaArchive,
  FaCalendarAlt,
  FaCheckCircle,
  FaEdit,
  FaRulerCombined,
  FaStar,
  FaTag,
  FaTimesCircle,
  FaTrash,
  FaUserEdit,
  FaWeightHanging,
} from "react-icons/fa";
import { HiFilter } from "react-icons/hi";
import { MdHistory } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";

import type { AdminProductType, Event } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import imageSrc from "@/app/lib/utilities/productImageHandler";
import Pagination, {
  type PaginationType,
} from "@/components/pagination/Pagination";
// import { updateQueryParams } from "@/components/util/updateQueryParams";
import MobileFilter from "@/components/ui/MobileFilter";
import SearchBar from "@/components/ui/SearchBar";
import Select from "@/components/ui/Select";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

// GraphQL Mutations
const TOGGLE_PRODUCT_STATUS = gql`
  mutation ToggleProductStatus($slug: String!) {
    toggleProductStatus(slug: $slug) {
      _id
      name
      slug
      active
      updated_at
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($_id: String!) {
    deleteProduct(_id: $_id) {
      _id
      name
      slug
    }
  }
`;

interface ToggleProductStatusResponse {
  toggleProductStatus: AdminProductType;
}

interface DeleteProductResponse {
  deleteProduct: AdminProductType;
}

type Category = string;
type ProductListProps = {
  products: AdminProductType[];
  categories: Category[];
  pagination: PaginationType;
};
const ProductList: FC<ProductListProps> = ({
  products,
  categories,
  pagination,
}) => {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useQueryState(
    "search",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 1000 })
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sort",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );
  const [productsList, setProductsList] = useState(products || []);
  const productsContainerRef = useRef<HTMLDivElement>(null);

  // GraphQL mutations
  const [toggleProductStatus] = useMutation<ToggleProductStatusResponse>(
    TOGGLE_PRODUCT_STATUS,
    {
      onCompleted: (data) => {
        setProductsList((prevProducts) =>
          prevProducts.map((product) =>
            product.slug === data.toggleProductStatus.slug
              ? { ...product, active: data.toggleProductStatus.active }
              : product
          )
        );
        toast.success(
          productsTranslate.products[lang].function.toggleProductStatus.success
        );
      },
      onError: (error) => {
        const errorMessage =
          error.graphQLErrors?.[0]?.message ||
          (error.networkError ? "Network error occurred" : null) ||
          productsTranslate.products[lang].error.general;
        toast.error(errorMessage);
      },
    }
  );

  const [deleteProduct] = useMutation<DeleteProductResponse>(DELETE_PRODUCT, {
    onCompleted: (data) => {
      setProductsList((prevProducts) =>
        prevProducts.filter((product) => product._id !== data.deleteProduct._id)
      );
      toast.success(
        productsTranslate.products[lang].function.handleDelete.success
      );
    },
    onError: (error) => {
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        productsTranslate.products[lang].error.general;
      toast.error(errorMessage);
    },
  });

  const handleCategoryFilterChange = (event: Event) => {
    const { value } = event.target;
    void setCategoryFilter(value);
  };
  const handleSortFilterChange = (event: Event) => {
    const { value } = event.target;
    void setSortOrder(value);
    // updateQueryParams({ sort: value }, searchParamsReadOnly, router, pathName);
  };

  const handleSearch = (event: Event) => {
    const { value } = event.target;
    void setSearchQuery(value);
  };

  const onPaginationChange = (page: number) => {
    // const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    void setCurrentPage(page);

    // if (page === 1) {
    //   paramsSearch.delete("page");
    //   router.push(pathName + "?" + paramsSearch.toString());
    //   return;
    // }
    // updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
  };
  const toggleProductStatusHandler = async (slug: string) => {
    try {
      await toggleProductStatus({
        variables: { slug },
      });
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProduct({
        variables: { _id: productId },
      });
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };
  useEffect(() => {
    if (productsContainerRef.current) {
      productsContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    window.scrollTo({ top: 1, behavior: "smooth" });
    setProductsList(products);
  }, [searchQuery, categoryFilter, currentPage, sortOrder, products]);
  return (
    <div className="p-2 bg-gray-100 /max-h-screen /overflow-hidden">
      {/* Mobile Filter Button */}
      <button
        onClick={() => {
          setIsMobileFiltersOpen(true);
        }}
        className="md:hidden flex w-full  items-center gap-2 p-3 bg-white rounded-lg shadow-md"
      >
        <HiFilter className="text-xl" />
        {shopPageTranslate[lang].shopPage.content.filters}
      </button>
      <div className="hidden md:flex flex-row items-center mb-6 gap-2">
        {/* Search Section */}
        <SearchBar
          className="w-full"
          searchQuery={searchQuery}
          handleSearch={handleSearch}
          placeholder={shopPageTranslate[lang].shopPage.content.search}
        />
        <Select
          id="categoryFilter"
          value={categoryFilter}
          options={[
            ...categories.map((category) => ({
              value: category,
              label: category,
            })),
          ]}
          placeholder={productsTranslate.products[lang].filter.select.all}
          onChange={handleCategoryFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 w-full"
        />
        <Select
          id="sortFilter"
          value={sortOrder}
          options={[
            {
              value: "-created_at",
              label: productsTranslate.products[lang].filter.select.newest,
            },
            {
              value: "created_at",
              label: productsTranslate.products[lang].filter.select.oldest,
            },
            {
              value: "-price",
              label:
                productsTranslate.products[lang].filter.select.highestPrice,
            },
            {
              value: "price",
              label: productsTranslate.products[lang].filter.select.lowestPrice,
            },

            {
              value: "-ratings_average",
              label: productsTranslate.products[lang].filter.select.topRated,
            },
            {
              value: "ratings_average",
              label: productsTranslate.products[lang].filter.select.lowestRated,
            },
          ]}
          placeholder={productsTranslate.products[lang].filter.select.all}
          onChange={handleSortFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 w-full"
        />
        <Link
          href="/dashboard/products/add"
          className="ml-auto p-2 bg-blue-500 text-white rounded-lg w-full
          cursor-pointer text-center"
          /* onClick={() => router.push("/dashboard/products/add")} */
        >
          {productsTranslate.products[lang].filter.addProduct}
        </Link>
      </div>
      {/* Mobile Filters */}
      {isMobileFiltersOpen ? (
        <MobileFilter
          closeFilters={() => {
            setIsMobileFiltersOpen(false);
          }}
        >
          <div className="flex flex-col  items-center mb-6 gap-2">
            {/* Search Section */}
            <SearchBar
              className="w-full"
              searchQuery={searchQuery}
              handleSearch={handleSearch}
              placeholder={shopPageTranslate[lang].shopPage.content.search}
              isMobile
            />
            <Select
              id="categoryFilter"
              value={categoryFilter}
              options={[
                ...categories.map((category) => ({
                  value: category,
                  label: category,
                })),
              ]}
              placeholder={productsTranslate.products[lang].filter.select.all}
              onChange={handleCategoryFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 w-full"
              isMobile
              label={productsTranslate.products[lang].filter.title}
            />
            <Select
              id="sortFilter"
              value={sortOrder}
              options={[
                {
                  value: "-created_at",
                  label: productsTranslate.products[lang].filter.select.newest,
                },
                {
                  value: "created_at",
                  label: productsTranslate.products[lang].filter.select.oldest,
                },
                {
                  value: "-price",
                  label:
                    productsTranslate.products[lang].filter.select.highestPrice,
                },
                {
                  value: "price",
                  label:
                    productsTranslate.products[lang].filter.select.lowestPrice,
                },

                {
                  value: "-ratings_average",
                  label:
                    productsTranslate.products[lang].filter.select.topRated,
                },
                {
                  value: "ratings_average",
                  label:
                    productsTranslate.products[lang].filter.select.lowestRated,
                },
              ]}
              placeholder={productsTranslate.products[lang].filter.select.all}
              onChange={handleSortFilterChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 w-full"
              label={productsTranslate.products[lang].filter.select.title}
              isMobile
            />
            <Link
              href="/dashboard/products/add"
              className="ml-auto p-2 bg-blue-500 text-white rounded-lg w-full
          cursor-pointer text-center my-2"
              /* onClick={() => router.push("/dashboard/products/add")} */
            >
              {productsTranslate.products[lang].filter.addProduct}
            </Link>
          </div>
        </MobileFilter>
      ) : null}
      <div ref={productsContainerRef} className="max-h-[70dvh] overflow-y-auto">
        <div
          className="grid col gap-4 p-4"
          style={
            {
              "--col-min-width": "320px",
              // "--col-gap": "1.5rem",
            } as React.CSSProperties
          }
        >
          {productsList.map((product) => {
            const discountExpireDate = product.discount_expire
              ? DateTime.fromJSDate(new Date(product.discount_expire))
              : null;
            const daysToExpire = discountExpireDate?.diffNow("days").days ?? 0;
            // const formattedExpireDate =
            //   discountExpireDate?.toFormat("MMM dd, yyyy") || "N/A";

            return (
              <div
                key={product.slug}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="p-6 flex flex-col gap-4">
                  {/* Product Header */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 truncate">
                        {product.name}
                      </h2>
                      <p className="text-xs text-gray-400 mt-1">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <span className="bg-indigo-600/10 text-indigo-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                      {product.category}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden border">
                    <Image
                      src={imageSrc(product)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority
                    />
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <p className="font-semibold text-gray-900">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Stock</p>
                      <p className="font-semibold text-gray-900">
                        {product.stock}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <p className="text-sm text-gray-500 mb-1">Sold</p>
                      <p className="font-semibold text-gray-900">
                        {product.sold}
                      </p>
                    </div>
                  </div>

                  {/* Discount & Expiry */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaTag className="text-purple-600" />
                        <span className="font-medium">Discount:</span>
                        <span className="text-purple-600">
                          ${product.discount.toFixed(2)}
                        </span>
                      </div>
                      <span
                        className={`text-sm ${daysToExpire > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {daysToExpire > 0 ? (
                          <>
                            <FaCalendarAlt className="inline mr-1" />
                            {Math.floor(daysToExpire)}d
                          </>
                        ) : (
                          <span className="flex items-center gap-1">
                            <FaTimesCircle className="inline" /> Expired
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaStar className="text-yellow-400" />
                        <span>Rating</span>
                      </div>
                      <span className="font-medium">
                        {product.ratings_average}/5
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaWeightHanging />
                        <span>Weight</span>
                      </div>
                      <span className="font-medium">
                        {product.shipping_info?.weight} kg
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-500">
                        <FaRulerCombined />
                        <span>Dimensions</span>
                      </div>
                      <span className="font-medium">
                        {product.shipping_info?.dimensions?.length}x
                        {product.shipping_info?.dimensions?.width}x
                        {product.shipping_info?.dimensions?.height}cm
                      </span>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="border-t pt-4 mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            product.active ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.active ? <FaCheckCircle /> : <FaArchive />}
                          <span>{product.active ? "Active" : "Archived"}</span>
                        </div>
                        {product.last_modified_by ? (
                          <div className="flex items-center gap-1 text-gray-400 text-sm">
                            <FaUserEdit />
                            <span className="truncate max-w-[120px]">
                              {product.last_modified_by.name}
                            </span>
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        {" "}
                        <Link
                          href={`/dashboard/products/${product.slug}/history`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <MdHistory className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            toggleProductStatusHandler(product.slug)
                          }
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-indigo-600 transition-colors"
                        >
                          <TfiReload className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/dashboard/products/${product.slug}/edit`}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(product._id)}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Pagination meta={pagination.meta} onPageChange={onPaginationChange} />
    </div>
  );
};

export default ProductList;
