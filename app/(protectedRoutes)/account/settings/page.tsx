export const dynamic = "force-dynamic";
import ChangePassword from "@/components/customer/changePassword";
import api from "@/components/util/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { accountSettingsTranslate } from "@/app/_translate/(protectedRoute)/account/settingsTranslate";
import { lang } from "@/components/util/lang";
export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/customer/device-info", {
      headers: Object.fromEntries(headers().entries()), // convert headers to object
    });
    const deviceInfo = data.data;
    return <ChangePassword devices={deviceInfo} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
    // throw new AppError(error.message, error.status);
  }
};

export default page;
