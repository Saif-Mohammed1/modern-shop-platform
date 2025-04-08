import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductVersionHistory from "@/components/products/ProductVersionHistory";

type SearchParams = {
  sort?: string;
  page?: string;
  limit?: string;
  actor?: string;
  action?: string;
};
const queryParams = async (slug: string, searchParams: SearchParams) => {
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
  if (searchParams.actor !== undefined) {
    url.append("actor", searchParams.actor);
  }
  if (searchParams.action !== undefined) {
    url.append("action", searchParams.action);
  }

  const queryString = url.toString();

  const {
    data: {
      product: { docs, meta, links },
    },
  } = await api.get(
    `/admin/dashboard/products/${slug}/history${queryString ? `?${queryString}` : ""}`,
    {
      headers: Object.fromEntries((await headers()).entries()), // convert headers to object
    }
  );
  return {
    docs,
    pagination: {
      meta,
      links,
    },
  };
};
const page = async (props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { slug } = params;

  try {
    const { docs, pagination } = await queryParams(slug, searchParams);

    return (
      <ProductVersionHistory
        pagination={
          pagination || {
            meta: {
              total: 0,
              page: 0,
              limit: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
            links: { previous: "", next: "" },
          }
        }
        slug={slug}
        versions={docs}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};
export default page;
