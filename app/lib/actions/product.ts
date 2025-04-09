// "use server";

// import type { ProductType } from "@/app/lib/types/products.types";
// //fetch prodect using server side rendering

// export interface ProductParams {
//   category?: string;
//   name?: string;
//   sort?: string;
//   fields?: string;
//   page?: string;
//   limit?: string;
//   rating?: string;
//   min?: string;
//   max?: string;
//   price?: string;
// }

// export const getProducts = async (
//   params: ProductParams
// ): Promise<ProductType[] | null> => {
//   const url = new URLSearchParams();
//   if (params.category) {
//     url.append("category", params.category);
//   }
//   if (params.name) {
//     url.append("name", params.name);
//   }
//   if (params.sort) {
//     url.append("sort", params.sort);
//   }
//   if (params.fields) {
//     url.append("fields", params.fields);
//   }
//   if (params.page) {
//     url.append("page", params.page);
//   }
//   if (params.limit) {
//     url.append("limit", params.limit);
//   }
//   if (params.rating) {
//     url.append("rating", params.rating);
//   }
//   if (params.min) {
//     url.append("price[gte]", params.min);
//   }
//   if (params.max) {
//     url.append("price[lte]", params.max);
//   }

//   const queryString = url.toString();
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/products?${queryString}`
//     );
//     const data: ProductType[] = await response.json();
//     return data;
//   } catch (error) {
//     return null;
//   }
// };
