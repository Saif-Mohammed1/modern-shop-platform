import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import AccountMenu from '@/components/customers/customerMaun';
import {addressTranslate} from '@/public/locales/client/(auth)/account/addressTranslate';

export const metadata: Metadata = {
  title: addressTranslate[lang].layout.metadata.title,
  description: addressTranslate[lang].layout.metadata.description,
  keywords: addressTranslate[lang].layout.metadata.keywords,
};
const layout = async ({children}: {children: React.ReactNode}) => {
  return (
    <div className="/bg-gray-100 min-h-screen p-1 flex flex-col sm:flex-row gap-3 max-w-[1200px] mx-auto ">
      <AccountMenu />
      {children}
    </div>
  );
  // }

  // // redirect("/auth");
};

export default layout;
