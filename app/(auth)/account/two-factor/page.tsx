import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import TwoFactorAuthManager from '@/components/2fa/TwoFactorAuth';
import {accountTwoFactorTranslate} from '@/public/locales/client/(auth)/account/twoFactorTranslate';

export const metadata: Metadata = {
  title: accountTwoFactorTranslate[lang].metadata.title,
  description: accountTwoFactorTranslate[lang].metadata.description,
  keywords: accountTwoFactorTranslate[lang].metadata.keywords,
};
const page = () => {
  return <TwoFactorAuthManager />;
};

export default page;
