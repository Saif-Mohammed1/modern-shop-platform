"use client";

import { FC, useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import moment from "moment";
import toast from "react-hot-toast";
import api from "@/components/util/axios.api";
import imageSrc from "@/components/util/productImageHandler";
import { updateQueryParams } from "@/components/util/updateQueryParams";
import {
  Event,
  productsTranslate,
  ProductType,
} from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import { lang } from "@/components/util/lang";

type Category = string;
type ProductListProps = {
  products: ProductType[];
  categories: Category[];
  totalPages: number;
};
const ProductList: FC<ProductListProps> = ({
  products,
  categories,
  totalPages,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [productsList, setProductsList] = useState(products || []);
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
  const handleSortFilterChange = (event: Event) => {
    const value = event.target.value;
    setSortOrder(value);
    updateQueryParams({ sort: value }, searchParamsReadOnly, router, pathName);
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
    // if (searchParamsReadOnly.has("price")) {
    //   setPriceFilter(searchParamsReadOnly.get("price") ?? 1);
    // }
    if (searchParamsReadOnly.has("sort")) {
      setSortOrder(searchParamsReadOnly.get("sort") ?? "");
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
  const handleEdit = (id: string) => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        productsTranslate.products[lang].function.handleDelete.loading
      );
      await api.delete(`/admin/dashboard/products/${id}`);
      setProductsList((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
      toast.success(
        productsTranslate.products[lang].function.handleDelete.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message || productsTranslate.products[lang].error.general
        );
      } else {
        toast.error(productsTranslate.products[lang].error.general);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
    // Implement delete functionality here
  };
  useEffect(() => {
    setProductsList(products);
  }, [products]);
  return (
    <div className="p-2 bg-gray-100 /max-h-screen /overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center mb-6 gap-2">
        <input
          type="text"
          placeholder={productsTranslate.products[lang].filter.input.search}
          className="p-2 border border-gray-300 rounded-lg mr-4 w-full"
          value={searchQuery}
          onChange={handleSearch}
        />{" "}
        <select
          id="categoryFilter"
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2 w-full"
        >
          <option value="">
            {productsTranslate.products[lang].filter.select.all}
          </option>
          {/* Add more categories as options here */}
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {/* <select
            className="p-2 border border-gray-300 rounded-lg mr-4"
            value={categoryFilter}
            onChange={handleCategoryFilterChange}
          >
            <option value="">All Categories</option>
            {/* Populate categories dynamically */}
        {/* <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="accessories">Accessories</option>
          </select> */}
        <select
          className="p-2 border border-gray-300 rounded-lg w-full"
          value={sortOrder}
          onChange={handleSortFilterChange}
        >
          <option value="">
            {productsTranslate.products[lang].filter.select.all}
          </option>
          <option value="-ratingsAverage">
            {productsTranslate.products[lang].filter.select.topRated}
          </option>
          <option value="ratingsAverage">
            {productsTranslate.products[lang].filter.select.lowestRated}
          </option>
        </select>
        <button
          className="ml-auto p-2 bg-blue-500 text-white rounded-lg w-full"
          onClick={() => router.push("/dashboard/products/add")}
        >
          {productsTranslate.products[lang].filter.addProduct}
        </button>
      </div>

      <div
        className="grid col max-h-[70dvh] overflow-y-auto"
        style={{ "--col-min-width": "200px" } as React.CSSProperties}
        //grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
      >
        {productsList.map((product) => {
          const discountExpireDate = moment(product.discountExpire);
          const currentDate = moment();
          const daysToExpire = discountExpireDate.diff(currentDate, "days");

          return (
            <div
              key={product._id}
              className="bg-white p-4 rounded-lg shadow-md overflow-hidden"
            >
              <Image
                src={imageSrc(product)}
                alt={product.name}
                //w-full h-40 object-cover
                className=" rounded-md mb-4"
                width={150}
                height={150}
                style={{ objectFit: "cover" }}
                priority
              />
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.category}:{" "}
                {product.category}
              </p>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.price}: $
                {product.price}
              </p>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.discount}: $
                {product.discount}
              </p>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.discountExpiry}:{" "}
                {daysToExpire > 0
                  ? `${daysToExpire}  ${productsTranslate.products[lang].details.daysleft}`
                  : productsTranslate.products[lang].details.expired}
              </p>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.stock}:{" "}
                {product.stock}
              </p>
              <p className="text-gray-600 mb-2">
                {productsTranslate.products[lang].details.rating}:{" "}
                {product.ratingsAverage}
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => handleEdit(product._id)}
                  className="text-blue-500 hover:underline"
                >
                  <FaEdit /> {productsTranslate.products[lang].details.edit}
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-500 hover:underline"
                >
                  <FaTrash /> {productsTranslate.products[lang].details.delete}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination
        currentPage={currentPage}
        onPageChange={onPaginationChange}
        totalPages={totalPages}
      />
    </div>
  );
};

export default ProductList;

{
  /* export default AdminProducts; */
}
