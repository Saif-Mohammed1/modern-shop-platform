export const dynamic = "force-dynamic";
import AddressBook from "@/components/customers/address/addressBook";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { addressTranslate } from "@/public/locales/client/(auth)/account/addressTranslate";
import { lang } from "@/app/lib/utilities/lang";

export const metadata: Metadata = {
  title: addressTranslate[lang].metadata.title,
  description: addressTranslate[lang].metadata.description,
  keywords: addressTranslate[lang].metadata.keywords,
};

const page = async () => {
  try {
    const { data } = await api.get("/customers/address", {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    const address = data.docs;

    return (
      <AddressBook addressList={address} hasNextPage={data.meta.hasNext} />
    );
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    //   throw new AppError(error.message, error.status);
  }
};

export default page;
