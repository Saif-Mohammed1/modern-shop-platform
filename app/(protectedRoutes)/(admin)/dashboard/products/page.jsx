// pages/admin/products.js

import ProductTicket from "@/components/shop/adminDashboard/ProductTicket";
import AdminProducts from "@/components/shop/adminDashboard/adminProduct";
import api from "@/components/util/axios.api";

const queryParams = async (searchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.category !== undefined) {
    url.append("category", searchParams.category);
  }
  if (searchParams.name !== undefined) {
    url.append("name", searchParams.name);
  }
  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }
  if (searchParams.fields !== undefined) {
    url.append("fields", searchParams.fields);
  }
  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append("limit", searchParams.limit);
  }
  if (searchParams.rating !== undefined) {
    url.append("rating", searchParams.rating);
  }
  // if (searchParams.min !== undefined) {
  //   url.append("price[gte]", searchParams.min);
  // }
  // if (searchParams.max !== undefined) {
  //   url.append("price[lte]", searchParams.max);
  // }

  const queryString = url.toString();
  try {
    const {
      data: {
        data,
        pageCount,
        categories: { categories },
      },
    } = await api.get("/shop/" + (queryString ? `?${queryString}` : ""));
    return { data, pageCount, categories };
  } catch (error) {
    throw error;
  }
};

const page = async ({ searchParams }) => {
  try {
    const { data, categories, pageCount } = await queryParams(searchParams);
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Manage Products</h1>
        {/* <ProductTicket
      //products={products}
      /> */}
        <AdminProducts
          products={data}
          categories={categories}
          totalPages={pageCount}
        />
      </div>
    );
  } catch (error) {
    throw error;
  }
};
export default page;
