import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import HomeComponent from "@/components/home/home";

import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";

// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading
export const metadata: Metadata = {
  title: rootStaticPagesTranslate[lang].home.metadata.title,
  description: rootStaticPagesTranslate[lang].home.metadata.description,
  keywords: rootStaticPagesTranslate[lang].home.metadata.keywords,
};

const GET_TOP_OFFERS_AND_NEW_PRODUCTS = `query {
  getTopOffersAndNewProducts{
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
export default async function Home() {
  try {
    const headersStore = await headers();
    const headersObj = Object.fromEntries(headersStore.entries());
    const {
      data: {
        data: { getTopOffersAndNewProducts },
      },
    } = await api.post("/graphql", {
      query: GET_TOP_OFFERS_AND_NEW_PRODUCTS,
      headers: headersObj,
    });

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
