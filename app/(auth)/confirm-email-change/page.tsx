import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import ConfirmEmailChange from "@/components/customers/emailUpdatedStatus";
import { confirmEmailChangeTranslate } from "@/public/locales/client/(public)/confirmEmailChangeTranslate";

export const metadata: Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};
type searchParams = {
  token: string;
  error?: string;
};
const page = async (props: { searchParams: Promise<searchParams> }) => {
  const searchParams = await props.searchParams;
  const token = searchParams.token || undefined;
  const error = searchParams.error || undefined;
  if (!token) {
    notFound();
  }
  try {
    const {
      data: { message },
    } = await api.get(
      `/customers/update-data/confirm-email-change?token=${token}`,
      {
        headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
      }
    );
    return <ConfirmEmailChange error={error} message={message} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ConfirmEmailChange error={message} />;
  }
};
export default page;
