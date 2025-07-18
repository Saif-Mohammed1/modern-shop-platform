//  app > (auth) > account > reviews > page.tsx
import { headers } from "next/headers";

import type { ReviewsType } from "@/app/lib/types/reviews.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ReviewHistory from "@/components/customers/reviewHistory";
import ErrorHandler from "@/components/Error/errorHandler";
import { accountReviewsTranslate } from "@/public/locales/client/(auth)/account/reviewsTranslate";

export const metadata = {
  title: accountReviewsTranslate[lang].metadata.title,
  description: accountReviewsTranslate[lang].metadata.description,
  keywords: accountReviewsTranslate[lang].metadata.keywords,
};
// const page = () => {
//   return <ReviewHistory />;
// };
const GET_REVIEWS = `
  query ($request: Filter) {
    getMyReviews(filter: $request) {
      docs {
        _id
        user_id
        product_id {
          name
          slug
        }
        rating
        comment
        created_at
      }
      meta {
        hasNext
      }
    }
  }
`;
const page = async () => {
  const headersObj = Object.fromEntries((await headers()).entries());
  try {
    const { getMyReviews } = await api_gql<{
      getMyReviews: {
        docs: ReviewsType[];
        meta: {
          hasNext: boolean;
        };
      };
    }>(
      GET_REVIEWS,
      {
        request: {
          page: 1,
          limit: 10,
        },
      },
      headersObj
    );

    return (
      <ReviewHistory
        reviewsList={getMyReviews.docs}
        hasNextPage={getMyReviews.meta.hasNext}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
