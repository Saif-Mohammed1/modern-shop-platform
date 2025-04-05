import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import ComingSoon from '@/components/commingSoon/ComingSoon';
import {accountTicketsTranslate} from '@/public/locales/client/(auth)/account/ticketsTranslate';

export const metadata: Metadata = {
  title: accountTicketsTranslate[lang].metadata.title,
  description: accountTicketsTranslate[lang].metadata.description,
  keywords: accountTicketsTranslate[lang].metadata.keywords,
};
const page = () => {
  return <ComingSoon />;
};

export default page;
