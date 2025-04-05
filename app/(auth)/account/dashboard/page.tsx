import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import AccountDashboard from '@/components/customers/accountDashboard';
import {accountDashboardTranslate} from '@/public/locales/client/(auth)/account/dashboardTranslate';

export const metadata: Metadata = {
  title: accountDashboardTranslate[lang].metadata.title,
  description: accountDashboardTranslate[lang].metadata.description,
  keywords: accountDashboardTranslate[lang].metadata.keywords,
};
const page = () => {
  return <AccountDashboard />;
};

export default page;
