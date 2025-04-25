// import { headers } from "next/headers";

// import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
// import ErrorHandler from "@/components/Error/errorHandler";
import WishlistPage from "@/components/shop/wishList/wishlist";
import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";

export const metadata = {
  title: accountWishlistTranslate[lang].metadata.title,
  description: accountWishlistTranslate[lang].metadata.description,
  keywords: accountWishlistTranslate[lang].metadata.keywords,
};
// type SearchParams = {
//   sort?: string;
//   page?: string;
//   limit?: string;
// };
// const queryParams = async (searchParams: SearchParams) => {
//   const url = new URLSearchParams();

//   if (searchParams.sort !== undefined) {
//     url.append("sort", searchParams.sort);
//   }

//   if (searchParams.page !== undefined) {
//     url.append("page", searchParams.page);
//   }
//   if (searchParams.limit !== undefined) {
//     url.append("limit", searchParams.limit);
//   }

//   // if (searchParams.min !== undefined) {
//   //   url.append("price[gte]", searchParams.min);
//   // }
//   // if (searchParams.max !== undefined) {
//   //   url.append("price[lte]", searchParams.max);
//   // }

//   const queryString = url.toString();

//   const {
//     data: { docs, meta, links },
//   } = await api.get(
//     `/customers/wishlist${queryString ? `?${queryString}` : ""}`,
//     {
//       headers: Object.fromEntries((await headers()).entries()), // convert headers to object
//     }
//   );
//   return {
//     docs,
//     pagination: {
//       meta,
//       links,
//     },
//   };
// };

// const page = async (props: { searchParams: Promise<SearchParams> }) => {
//   const searchParams = await props.searchParams;
//   try {
//     const { docs, pagination } = await queryParams(searchParams);
//     return <WishlistPage wishlistProduct={docs} pagination={pagination} />;
//   } catch (error: unknown) {
//     const { message } = error as Error;
//     return <ErrorHandler message={message} />;
//   }
// };

// export default page;
const page = async () => {
  return <WishlistPage />;
};

export default page;
