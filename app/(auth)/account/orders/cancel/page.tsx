import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import OrderCancellation from '@/components/shop/orders/cancellingReason';
import {accountOrdersTranslate} from '@/public/locales/client/(auth)/account/ordersTranslate';

export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].orderCancellation.metadata.title,
  description: accountOrdersTranslate[lang].orderCancellation.metadata.description,
  keywords: accountOrdersTranslate[lang].orderCancellation.metadata.keywords,
};
const page = () => {
  return <OrderCancellation />;
};

export default page;
