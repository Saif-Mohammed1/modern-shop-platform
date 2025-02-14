export const dynamic = "force-dynamic";
// import AppError from "@/components/util/appError";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { dashboardTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/dashboardTranslate";
import { lang } from "@/app/lib/utilities/lang";
import api from "@/app/lib/utilities/api";
import Dashboard from "@/components/(admin)/dashboard/dashboard";
import ErrorHandler from "@/components/Error/errorHandler";

export const metadata: Metadata = {
  title: dashboardTranslate.metadata[lang].title,
  description: dashboardTranslate.metadata[lang].description,
  keywords: dashboardTranslate.metadata[lang].keywords,
};
const page = async () => {
  try {
    const {
      data: { data },
    } = await api.get("/admin/dashboard", {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    return <Dashboard dashboardData={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
