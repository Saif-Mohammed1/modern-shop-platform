import {headers} from 'next/headers';

import api from '@/app/lib/utilities/api';
import {lang} from '@/app/lib/utilities/lang';
// import AppError from "@/components/util/appError";
import ReviewHistory from '@/components/customers/reviewHistory';
import ErrorHandler from '@/components/Error/errorHandler';
import {accountReviewsTranslate} from '@/public/locales/client/(auth)/account/reviewsTranslate';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: accountReviewsTranslate[lang].metadata.title,
  description: accountReviewsTranslate[lang].metadata.description,
  keywords: accountReviewsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const {data} = await api.get('/customers/reviews', {
      headers: Object.fromEntries((await headers()).entries()), //convert headers to object
    });
    const reviews = data.docs;
    return <ReviewHistory reviewsList={reviews} hasNextPage={data.meta.hasNext} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
