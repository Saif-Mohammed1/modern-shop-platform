import { accountWishlistTranslate } from "@/public/locales/client/(auth)/account/wishlistTranslate";
import WishlistPage from "@/components/shop/wishList/wishlist";
import { lang } from "@/app/lib/utilities/lang";
import api from "@/app/lib/utilities/api";
import { headers } from "next/headers";
import AppError from "@/app/lib/utilities/appError";
import ErrorHandler from "@/components/Error/errorHandler";
export const metadata = {
  title: accountWishlistTranslate[lang].metadata.title,
  description: accountWishlistTranslate[lang].metadata.description,
  keywords: accountWishlistTranslate[lang].metadata.keywords,
};
type SearchParams = {
  sort?: string;
  page?: string;
  limit?: string;
};
const queryParams = async (searchParams: SearchParams) => {
  const url = new URLSearchParams();

  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }

  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append("limit", searchParams.limit);
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
      data: { docs, meta, links },
    } = await api.get(
      "/customers/wishlist" + (queryString ? `?${queryString}` : ""),
      {
        headers: Object.fromEntries(headers().entries()), // convert headers to object
      }
    );
    return {
      docs,
      pagination: {
        meta,
        links,
      },
    };
  } catch (error: any) {
    throw new AppError(error.message, error.status);
  }
};

const page = async ({ searchParams }: { searchParams: SearchParams }) => {
  try {
    const { docs, pagination } = await queryParams(searchParams);
    console.log("pagination", pagination);
    return <WishlistPage wishlistProduct={docs} pagination={pagination} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;
  }
};

export default page;
