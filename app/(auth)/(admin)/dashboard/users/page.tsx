import type { Metadata } from "next";
import { headers } from "next/headers";

import type { UserAuthType } from "@/app/lib/types/users.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import AdminUsers from "@/components/(admin)/dashboard/users/users";
import ErrorHandler from "@/components/Error/errorHandler";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

export const metadata: Metadata = {
  title: usersTranslate.metadata[lang].title,
  description: usersTranslate.metadata[lang].description,
  keywords: usersTranslate.metadata[lang].keywords,
};
interface SearchParams {
  search?: string;
  status?: string;
  active?: boolean;
  sort?: string;
  role?: string;
  page?: number;
  limit?: number;
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};
const GET_ALL_USERS_QUERY = /* GraphQL */ `
  query GetAllUsers($filter: UserFilterInput) {
    getAllUsers(filter: $filter) {
      docs {
        _id
        name
        email
        phone
        role
        status
        created_at
        verification {
          email_verified
          phone_verified
        }
        two_factor_enabled
        login_notification_sent
        status
      }
      meta {
        total
        page
        limit
        totalPages
        hasNext
        hasPrev
      }
      links {
        prev
        first
      }
    }
  }
`;

const page = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const headersObject = Object.fromEntries((await headers()).entries());
  const defaultSearchParams = {
    search: searchParams.search || undefined,
    status: searchParams.status || undefined,
    active: searchParams.active || undefined,
    sort: searchParams.sort || undefined,
    role: searchParams.role || undefined,
    page: searchParams.page ? +searchParams.page : 1,
    limit: searchParams.limit ? +searchParams.limit : 10,
  };

  try {
    const { getAllUsers } = await api_gql<{
      getAllUsers: {
        docs: UserAuthType[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
        links: {
          prev: string;
          first: string;
        };
      };
    }>(
      GET_ALL_USERS_QUERY,
      {
        filter: defaultSearchParams,
      },
      headersObject
    );
    return (
      <AdminUsers
        users={getAllUsers.docs}
        pagination={{
          meta: getAllUsers.meta || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
          links: getAllUsers.links || {
            prev: "",
            first: "",
          },
        }}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
