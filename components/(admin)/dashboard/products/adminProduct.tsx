"use client";

import { FC, useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

import Image from "next/image";
// import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import moment from "moment";
import toast from "react-hot-toast";
import api from "@/app/lib/util/api";
import imageSrc from "@/app/lib/util/productImageHandler";
// import { updateQueryParams } from "@/components/util/updateQueryParams";
import { productsTranslate } from "@/app/_translate/(auth)/(admin)/dashboard/productTranslate";
import { lang } from "@/app/lib/util/lang";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import Link from "next/link";
import { Event, ProductType } from "@/app/lib/types/products.types";
import { TfiReload } from "react-icons/tfi";
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
  const [searchQuery, setSearchQuery] = useQueryState(
    "name",
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

  const handleCategoryFilterChange = (event: Event) => {
    const value = event.target.value;
    setCategoryFilter(value);
  };
  const handleSortFilterChange = (event: Event) => {
    const value = event.target.value;
    setSortOrder(value);
    // updateQueryParams({ sort: value }, searchParamsReadOnly, router, pathName);
  };

  const handleSearch = (event: Event) => {
    const value = event.target.value;
    setSearchQuery(value);
  };

  const onPaginationChange = (page: number) => {
    // const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    setCurrentPage(page);

    // if (page === 1) {
    //   paramsSearch.delete("page");
    //   router.push(pathName + "?" + paramsSearch.toString());
    //   return;
    // }
    // updateQueryParams({ page }, searchParamsReadOnly, router, pathName);
  };
  const toggleProductStatus = async (id: string) => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        productsTranslate.products[lang].function.toggleProductStatus.loading
      );
      await api.put(`/admin/dashboard/products/${id}/active`, {
        active: !productsList.find((product) => product._id === id)?.active,
      });
      setProductsList((prevProducts) =>
        prevProducts.map((product) =>
          product._id === id ? { ...product, active: !product.active } : product
        )
      );
      toast.success(
        productsTranslate.products[lang].function.toggleProductStatus.success
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
        <Link
          href="/dashboard/products/add"
          className="ml-auto p-2 bg-blue-500 text-white rounded-lg w-full
          cursor-pointer text-center"
          /* onClick={() => router.push("/dashboard/products/add")} */
        >
          {productsTranslate.products[lang].filter.addProduct}
        </Link>
      </div>
      <div ref={productsContainerRef} className="max-h-[70dvh] overflow-y-auto">
        <div
          className="grid col "
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
                <div className="imgParent">
                  <Image
                    src={imageSrc(product)}
                    alt={product.name}
                    //w-full h-40 object-cover
                    // className="  "
                    // className="w-full h-full #h-auto object-cover rounded-lg"
                    width={150}
                    height={150}
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray-600 mb-2">
                  {productsTranslate.products[lang].details.category}:{" "}
                  {product.category}
                </p>
                <p className="text-gray-600 mb-2">
                  {productsTranslate.products[lang].details.price}: $
                  {parseFloat(product.price.toString()).toFixed(2)}
                </p>
                <p className="text-gray-600 mb-2">
                  {productsTranslate.products[lang].details.discount}: $
                  {parseFloat(product.discount.toString()).toFixed(2)}
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
                <div className="flex justify-between items-center">
                  <p className="text-gray-600 mb-2">
                    {productsTranslate.products[lang].details.archived.title}:{" "}
                  </p>
                  <p className="text-gray-600 mb-2 mx-1">
                    {" "}
                    {" " + product.active
                      ? productsTranslate.products[lang].details.archived.no
                      : productsTranslate.products[lang].details.archived.yes}
                  </p>
                  <button
                    className="flex justify-end flex-1"
                    onClick={() => toggleProductStatus(product._id)}
                  >
                    <TfiReload size={20} />{" "}
                  </button>
                </div>
                <div className="flex justify-between">
                  <Link
                    href={`/dashboard/products/edit/${product._id}`}
                    /* onClick={() => handleEdit(product._id)} */
                    className="text-blue-500 hover:underline   cursor-pointer text-center"
                  >
                    <FaEdit /> {productsTranslate.products[lang].details.edit}
                  </Link>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="text-red-500 hover:underline   cursor-pointer text-center"
                  >
                    <FaTrash />{" "}
                    {productsTranslate.products[lang].details.delete}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
