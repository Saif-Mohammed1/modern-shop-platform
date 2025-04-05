import type {Metadata} from 'next';
import {headers} from 'next/headers';

import api from '@/app/lib/utilities/api';
import {lang} from '@/app/lib/utilities/lang';
// import AppError from "@/components/util/appError";
import ChangePassword from '@/components/customers/changePassword';
import ErrorHandler from '@/components/Error/errorHandler';
import {accountSettingsTranslate} from '@/public/locales/client/(auth)/account/settingsTranslate';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const {data} = await api.get('/customers/device', {
      headers: Object.fromEntries((await headers()).entries()), // convert headers to object
    });
    return <ChangePassword devices={data.docs} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
    // throw new AppError(error.message, error.status);
  }
};

export default page;
