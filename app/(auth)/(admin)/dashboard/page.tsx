// import AppError from "@/components/util/appError";
import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import Dashboard from "@/components/(admin)/dashboard/dashboard";
import ErrorHandler from "@/components/Error/errorHandler";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: dashboardTranslate.metadata[lang].title,
  description: dashboardTranslate.metadata[lang].description,
  keywords: dashboardTranslate.metadata[lang].keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/admin/dashboard", {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return <Dashboard dashboardData={data} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
