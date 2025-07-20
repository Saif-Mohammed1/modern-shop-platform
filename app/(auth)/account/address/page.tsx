import type { Metadata } from "next";
import { headers } from "next/headers";

import type { AddressType } from "@/app/lib/types/address.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import AddressBook from "@/components/customers/address/addressBook";
import ErrorHandler from "@/components/Error/errorHandler";
import { addressTranslate } from "@/public/locales/client/(auth)/account/addressTranslate";

export const metadata: Metadata = {
  title: addressTranslate[lang].metadata.title,
  description: addressTranslate[lang].metadata.description,
  keywords: addressTranslate[lang].metadata.keywords,
};
const GET_ADDRESSES_QUERY = `
  query ($filter: Filter) {
    getMyAddress(filter: $filter) {
      docs {
        _id
        phone
        user_id
        street
        city
        state
        postal_code
        country
      }

      meta {
        hasNext
        total
      }
    }
  }
`;
const page = async () => {
  const headersObj = Object.fromEntries((await headers()).entries());
  try {
    const { getMyAddress } = await api_gql<{
      getMyAddress: {
        docs: AddressType[];
        meta: {
          hasNext: boolean;
          total: number;
        };
      };
    }>(
      GET_ADDRESSES_QUERY,
      {
        filter: {
          page: 1,
          limit: 10,
        },
      },
      headersObj
    );

    return (
      <AddressBook
        initialAddresses={getMyAddress.docs}
        hasNextPage={getMyAddress.meta.hasNext}
        totalAddresses={getMyAddress.meta.total}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

// const page = () => <AddressBook />;
export default page;
