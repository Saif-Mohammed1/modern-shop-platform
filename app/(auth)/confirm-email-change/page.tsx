import { confirmEmailChangeTranslate } from "@/public/locales/client/(public)/confirmEmailChangeTranslate";
import ConfirmEmailChange from "@/components/customers/emailUpdatedStatus";

import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import api from "@/app/lib/utilities/api";
import { headers } from "next/headers";
export const metadata: Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};
type searchParams = {
  token: string;
  error?: string;
};
const page = async ({ searchParams }: { searchParams: searchParams }) => {
  const token = searchParams.token || undefined;
  const error = searchParams.error || undefined;
  if (!token) notFound();
  try {
    const { data } = await api.get(
      `/customers/update-data/confirm-email-change?token=` + token,
      {
        headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
      }
    );
    return <ConfirmEmailChange error={error} message={data.message} />;
  } catch (error: any) {
    return <ConfirmEmailChange error={error} />;
  }
};
export default page;
