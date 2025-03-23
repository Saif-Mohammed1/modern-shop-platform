export const dynamic = "force-dynamic";
import ChangePassword from "@/components/customers/changePassword";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";
import { lang } from "@/app/lib/utilities/lang";
export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/customers/device", {
      headers: Object.fromEntries((await headers()).entries()), // convert headers to object
    });
    return <ChangePassword devices={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
    // throw new AppError(error.message, error.status);
  }
};

export default page;
