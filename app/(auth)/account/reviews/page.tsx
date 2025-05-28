export const dynamic = "force-dynamic";
import { headers } from "next/headers";

import type { ReviewsType } from "@/app/lib/types/reviews.db.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ReviewHistory from "@/components/customers/reviewHistory";
import ErrorHandler from "@/components/Error/errorHandler";
import { accountReviewsTranslate } from "@/public/locales/client/(auth)/account/reviewsTranslate";

export const metadata = {
  title: accountReviewsTranslate[lang].metadata.title,
  description: accountReviewsTranslate[lang].metadata.description,
  keywords: accountReviewsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const {
      data,
    }: {
      data: {
        docs: ReviewsType[];
        meta: {
          hasNext: boolean;
        };
      };
    } = await api.get("/customers/reviews", {
      headers: Object.fromEntries((await headers()).entries()), //convert headers to object
    });
    const reviews = data.docs;
    return (
      <ReviewHistory reviewsList={reviews} hasNextPage={data.meta.hasNext} />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
