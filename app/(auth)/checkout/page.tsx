import type { Metadata } from "next";
import { headers } from "next/headers";

import type { AddressType } from "@/app/lib/types/address.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import CheckoutPage from "@/components/shop/checkout/checkout";
import { checkoutPageTranslate } from "@/public/locales/client/(public)/checkoutPageTranslate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: checkoutPageTranslate[lang].metadata.title,
  description: checkoutPageTranslate[lang].metadata.description,
  keywords: checkoutPageTranslate[lang].metadata.keywords,
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

const Page = async () => {
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
    }>(GET_ADDRESSES_QUERY, { filter: {} }, headersObj);

    return <CheckoutPage address={getMyAddress.docs || []} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default Page;
