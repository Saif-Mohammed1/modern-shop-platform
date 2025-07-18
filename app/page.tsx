import type { Metadata } from "next";
import { headers } from "next/headers";

import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import HomeComponent from "@/components/home/home";

import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";

import type { ProductType } from "./lib/types/products.types";
import { api_gql } from "./lib/utilities/api.graphql";

// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading
export const metadata: Metadata = {
  title: rootStaticPagesTranslate[lang].home.metadata.title,
  description: rootStaticPagesTranslate[lang].home.metadata.description,
  keywords: rootStaticPagesTranslate[lang].home.metadata.keywords,
};

const GET_TOP_OFFERS_AND_NEW_PRODUCTS = /* GraphQL */ `
  query {
    getTopOffersAndNewProducts {
      topOfferProducts {
        _id
        name
        category
        price
        discount
        discount_expire
        description
        ratings_average
        ratings_quantity
        slug

        images {
          _id
          link
          public_id
        }
      }
      newProducts {
        _id
        name
        category
        price
        discount
        discount_expire
        description
        ratings_average
        ratings_quantity
        slug

        images {
          _id
          link
          public_id
        }
      }
      topRating {
        _id
        name
        category
        price
        discount
        discount_expire
        description
        ratings_average
        ratings_quantity
        slug

        images {
          _id
          link
          public_id
        }
      }
    }
  }
`;
interface TopOfferProducts {
  topOfferProducts: ProductType[];
  newProducts: ProductType[];
  topRating: ProductType[];
}
export default async function Home() {
  try {
    const headersStore = await headers();
    const headersObj = Object.fromEntries(headersStore.entries());
    const { getTopOffersAndNewProducts } = await api_gql<{
      getTopOffersAndNewProducts: TopOfferProducts;
    }>(GET_TOP_OFFERS_AND_NEW_PRODUCTS, undefined, headersObj);

    return (
      // <ComponentLoading>
      <HomeComponent
        productData={getTopOffersAndNewProducts}
        // topOfferProducts={topOfferProducts}
        // newProducts={newProducts}
        // topRating={topRating}
      />
      // </ComponentLoading>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;

    // throw new AppError(error.message, error.status);
  }
}
