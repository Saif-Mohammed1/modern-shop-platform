import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import CheckoutPage from "@/components/shop/checkout/checkout";
import { checkoutPageTranslate } from "@/public/locales/client/(public)/checkoutPageTranslate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: checkoutPageTranslate[lang].metadata.title,
  description: checkoutPageTranslate[lang].metadata.description,
  keywords: checkoutPageTranslate[lang].metadata.keywords,
};
const Page = async () => {
  try {
    const { data } = await api.get("/customers/address", {
      headers: Object.fromEntries((await headers()).entries()), //convert headers to object
    });
    return <CheckoutPage address={data || []} />;

    //
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default Page;
