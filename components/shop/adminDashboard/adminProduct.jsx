"use client";

import { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BiSearch } from "react-icons/bi";
import { useCartItems } from "../../context/cart.context";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Pagination from "@/components/pagination/Pagination";
import moment from "moment";
import toast from "react-hot-toast";
import api from "@/components/util/axios.api";
import imageSrc from "@/components/util/productImageHandler";

const AdminProducts = () => {
  const { cartItems } = useCartItems();
  const [products, setProducts] = useState(cartItems || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  //   if (loading) return <p>Loading...</p>;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Manage Products</h1>

      <div className="mb-6 flex items-center">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border border-gray-300 rounded-lg mr-4 w-full"
        />
        <BiSearch className="w-6 h-6 text-gray-600" />
      </div>

      <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-4">Image</th>
            <th className="p-4">Name</th>
            <th className="p-4">Category</th>
            <th className="p-4">Price</th>
            <th className="p-4">Discount</th>
            <th className="p-4">Stock</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            return (
              <tr key={product._id}>
                <td className="p-4">
                  <Image
                    src={imageSrc(product)}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-md"
                    width={60}
                    height={60}
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </td>
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category}</td>
                <td className="p-4">${product.price}</td>
                <td className="p-4">{product.discount}%</td>
                <td className="p-4">{product.stock}</td>
                <td className="p-4 flex space-x-2">
                  <button className="p-2 text-blue-600 hover:text-blue-800">
                    <FaEdit />
                  </button>
                  <button className="p-2 text-red-600 hover:text-red-800">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const ProductList = ({ products, categories, totalPages }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState("");
  const [productsList, setProductsList] = useState(products || []);
  const router = useRouter();
  const pathName = usePathname();
  const searchParamsReadOnly = useSearchParams();
  const debounceTimeout = useRef(null);
  const updateQueryParams = (params) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    for (const key in params) {
      if (params[key] === "") {
        paramsSearch.delete(key);
      } else {
        paramsSearch.set(key, params[key]);
      }
    }

    router.push(pathName + "?" + paramsSearch.toString());
  };

  const handleCategoryFilterChange = (event) => {
    const value = event.target.value;
    setCategoryFilter(value);
    updateQueryParams({ category: value });
  };
  const handleSortFilterChange = (event) => {
    const value = event.target.value;
    setSortOrder(value);
    updateQueryParams({ sort: value });
  };

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearchQuery(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      updateQueryParams({ name: value });
    }, 1000); // Adjust the debounce delay as needed
  };

  const onPaginationChange = (page) => {
    const paramsSearch = new URLSearchParams(searchParamsReadOnly.toString());
    setCurrentPage(page);

    if (page === 1) {
      paramsSearch.delete("page");
      router.push(pathName + "?" + paramsSearch.toString());
      return;
    }
    updateQueryParams({ page });
  };

  useEffect(() => {
    if (searchParamsReadOnly.has("category")) {
      setCategoryFilter(searchParamsReadOnly.get("category"));
    }
    if (searchParamsReadOnly.has("price")) {
      setPriceFilter(searchParamsReadOnly.get("price"));
    }
    if (searchParamsReadOnly.has("sort")) {
      setSortOrder(searchParamsReadOnly.get("sort"));
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
  const handleEdit = (id) => {
    router.push(`/dashboard/products/edit/${id}`);
  };

  const handleDelete = async (id) => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Deleting product...");
      const { data } = await api.delete(`/admin/dashboard/products/${id}`);
      setProductsList((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error?.message || error || "An error occurred");
    } finally {
      toast.dismiss(toastLoading);
    }
    // Implement delete functionality here
  };

  return (
    <div className="p-2 bg-gray-100 max-h-screen overflow-hidden">
      <div className="flex items-center mb-6">
        <input
          type="text"
          placeholder="Search..."
          className="p-2 border border-gray-300 rounded-lg mr-4"
          value={searchQuery}
          onChange={handleSearch}
        />{" "}
        <select
          id="categoryFilter"
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mr-2"
        >
          <option value="">All</option>
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
          className="p-2 border border-gray-300 rounded-lg"
          value={sortOrder}
          onChange={handleSortFilterChange}
        >
          <option value="">All</option>
          <option value="-ratingsAverage">Top Rated</option>
          <option value="ratingsAverage">Lowest Rated</option>
        </select>
        <button
          className="ml-auto p-2 bg-blue-500 text-white rounded-lg"
          onClick={() => router.push("/dashboard/products/add")}
        >
          Add Product
        </button>
      </div>

      <div
        className="grid col max-h-[70dvh] overflow-y-auto"
        style={{ "--col-min-width": "200px" }}
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
              <p className="text-gray-600 mb-2">Category: {product.category}</p>
              <p className="text-gray-800 mb-2">Price: ${product.price}</p>
              <p className="text-gray-800 mb-2">
                Discount: ${product.discount}
              </p>
              <p className="text-gray-800 mb-2">
                DiscountExpiry:{" "}
                {daysToExpire > 0 ? `${daysToExpire} days left` : "Expired"}
              </p>
              <p className="text-gray-600 mb-2">Stock: {product.stock}</p>
              <p className="text-gray-600 mb-2">
                Rating: {product.ratingsAverage}
              </p>
              <div className="flex justify-between">
                <button
                  onClick={() => handleEdit(product._id)}
                  className="text-blue-500 hover:underline"
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(product._id)}
                  className="text-red-500 hover:underline"
                >
                  <FaTrash /> Delete
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
