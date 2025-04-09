import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import AdminUsers from "@/components/(admin)/dashboard/users/users";
import ErrorHandler from "@/components/Error/errorHandler";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

export const metadata: Metadata = {
  title: usersTranslate.metadata[lang].title,
  description: usersTranslate.metadata[lang].description,
  keywords: usersTranslate.metadata[lang].keywords,
};
type SearchParams = { [key: string]: string | undefined };

const queryParams = async (searchParams: SearchParams) => {
  const url = new URLSearchParams();

  // Append each parameter only if it's not undefined
  if (searchParams.email !== undefined) {
    url.append("email", searchParams.email);
  }
  if (searchParams.search !== undefined) {
    url.append("search", searchParams.search);
  }
  if (searchParams.status !== undefined) {
    url.append("status", searchParams.status);
  }
  if (searchParams.sort !== undefined) {
    url.append("sort", searchParams.sort);
  }
  if (searchParams.role !== undefined) {
    url.append("role", searchParams.role);
  }
  if (searchParams.page !== undefined) {
    url.append("page", searchParams.page);
  }
  if (searchParams.limit !== undefined) {
    url.append("limit", searchParams.limit);
  }

  const queryString = url.toString();

  const {
    data: { docs, meta, links },
  } = await api.get(
    `/admin/dashboard/users${queryString ? `?${queryString}` : ""}`,
    {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    }
  );

  return { users: docs, pagination: { meta, links } };
};
type PageProps = {
  searchParams: Promise<SearchParams>;
};
const page = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  // const defaultSearchParams = {
  //   email: searchParams.email || undefined,
  //   search: searchParams.s || undefined,
  //   active: searchParams.active || undefined,
  //   sort: searchParams.sort || undefined,
  //   role: searchParams.role || undefined,
  //   page: searchParams.page || undefined,
  //   limit: searchParams.limit || undefined,
  // };

  try {
    const { users, pagination } = await queryParams(searchParams);

    return (
      <AdminUsers
        users={users}
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
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
