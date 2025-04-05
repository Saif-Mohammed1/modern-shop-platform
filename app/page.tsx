import type {Metadata} from 'next';
import {headers} from 'next/headers';

import api from '@/app/lib/utilities/api';
import {lang} from '@/app/lib/utilities/lang';
import ErrorHandler from '@/components/Error/errorHandler';
import HomeComponent from '@/components/home/home';

import {rootStaticPagesTranslate} from '../public/locales/client/(public)/rootStaticPagesTranslate';

// import ComponentLoading from "@/components/spinner/componentLoading";//no need this we use next loading
export const metadata: Metadata = {
  title: rootStaticPagesTranslate[lang].home.metadata.title,
  description: rootStaticPagesTranslate[lang].home.metadata.description,
  keywords: rootStaticPagesTranslate[lang].home.metadata.keywords,
};
export default async function Home() {
  try {
    const headersStore = await headers();
    const headersObj = Object.fromEntries(headersStore.entries());
    const {data} = await api.get('/shop/home', {
      headers: headersObj,
    });

    return (
      // <ComponentLoading>
      <HomeComponent
        productData={data}
        // topOfferProducts={topOfferProducts}
        // newProducts={newProducts}
        // topRating={topRating}
      />
      // </ComponentLoading>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
}
