import type {Metadata} from 'next';
import {headers} from 'next/headers';

import api from '@/app/lib/utilities/api';
import {lang} from '@/app/lib/utilities/lang';
import ErrorHandler from '@/components/Error/errorHandler';
import OrderCompleted from '@/components/shop/orders/orderCompletedPrushers';
import {accountOrdersTranslate} from '@/public/locales/client/(auth)/account/ordersTranslate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].orderCompleted.metadata.title,
  description: accountOrdersTranslate[lang].orderCompleted.metadata.description,
  keywords: accountOrdersTranslate[lang].orderCompleted.metadata.keywords,
};
const page = async () => {
  try {
    const {data} = await api.get('/customers/orders/latest', {
      headers: Object.fromEntries((await headers()).entries()), // convert headers to object
    });

    return <OrderCompleted order={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
