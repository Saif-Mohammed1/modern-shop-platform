export const dynamic = "force-dynamic";
import CheckoutPage from "@/components/shop/checkout/checkout";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { checkoutPageTranslate } from "@/public/locales/client/(public)/checkoutPageTranslate";
import { lang } from "@/app/lib/utilities/lang";
export const metadata: Metadata = {
  title: checkoutPageTranslate[lang].metadata.title,
  description: checkoutPageTranslate[lang].metadata.description,
  keywords: checkoutPageTranslate[lang].metadata.keywords,
};
const Page = async () => {
  try {
    const { data } = await api.get("/customers/address", {
      headers: Object.fromEntries(headers().entries()), //convert headers to object
    });
    const address = data?.data;
    return <CheckoutPage address={address || []} />;

    //
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
    //     throw new AppError(error.message, error.status);
  }
};

export default Page;
