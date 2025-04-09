import type { Metadata } from "next";
import { headers } from "next/headers";

import type { sessionInfo } from "@/app/lib/types/session.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
// import AppError from "@/components/util/appError";
import ChangePassword from "@/components/customers/changePassword";
import ErrorHandler from "@/components/Error/errorHandler";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};
const page = async () => {
  try {
    const {
      data,
    }: {
      data: {
        docs: sessionInfo[];
      };
    } = await api.get("/customers/device", {
      headers: Object.fromEntries((await headers()).entries()), // convert headers to object
    });
    return <ChangePassword devices={data.docs} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
