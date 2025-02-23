export const dynamic = "force-dynamic";
import ReviewHistory from "@/components/customers/reviewHistory";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import { accountReviewsTranslate } from "@/public/locales/client/(auth)/account/reviewsTranslate";
import { lang } from "@/app/lib/utilities/lang";
export const metadata = {
  title: accountReviewsTranslate[lang].metadata.title,
  description: accountReviewsTranslate[lang].metadata.description,
  keywords: accountReviewsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/customers/reviews", {
      headers: Object.fromEntries(headers().entries()), //convert headers to object
    });
    const reviews = data.data;
    return (
      <ReviewHistory reviewsList={reviews} hasNextPage={data.hasNextPage} />
    );
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
