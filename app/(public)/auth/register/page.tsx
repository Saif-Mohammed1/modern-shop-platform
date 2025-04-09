import type {Metadata} from 'next';

import {lang} from '@/app/lib/utilities/lang';
import RegisterPage from '@/components/authentication/register';
import {registerTranslate} from '@/public/locales/client/(public)/auth/registerTranslate';

export const metadata: Metadata = {
  title: registerTranslate[lang].metadata.title,
  description: registerTranslate[lang].metadata.description,
  keywords: registerTranslate[lang].metadata.keywords,
};

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <RegisterPage />
    </div>
  );
};

export default page;
