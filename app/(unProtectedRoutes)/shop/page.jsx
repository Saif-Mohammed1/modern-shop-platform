import Shop from "@/components/shop/shop";
import api from "@/components/util/axios.api";

export const metadata = {
  title: "Online Shop - Buy the Best Products",
  description:
    "Welcome to our online shop where you can find a wide range of high-quality products. Shop now and enjoy great deals and fast shipping!",
};
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
      <Shop
        products={data || []}
        categories={categories || []}
        totalPages={pageCount || 1}
      />
    );
  } catch (error) {
    throw error;
  }
};

export default page;
