export const dynamic = "force-dynamic";
import AddressBook from "@/components/customer/address/addressBook";
import api from "@/components/util/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { addressTranslate } from "@/app/_translate/(protectedRoute)/account/addressTranslate";
import { lang } from "@/components/util/lang";

export const metadata: Metadata = {
  title: addressTranslate[lang].metadata.title,
  description: addressTranslate[lang].metadata.description,
  keywords: addressTranslate[lang].metadata.keywords,
};

const page = async () => {
  try {
    const { data } = await api.get("/customer/address", {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    const address = data.data;

    return <AddressBook addressList={address} hasNextPage={data.hasNextPage} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    //   throw new AppError(error.message, error.status);
  }
};

export default page;
