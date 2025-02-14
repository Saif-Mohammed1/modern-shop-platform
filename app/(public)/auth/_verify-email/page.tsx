import { verifyEmailPasswordTranslate } from "@/public/locales/client/(public)/auth/verifyEmailPasswordTranslate copy";
import EmailVerificationPage from "@/components/authentication/_emailVerification";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: verifyEmailPasswordTranslate[lang].metadata.title,
  description: verifyEmailPasswordTranslate[lang].metadata.description,
  keywords: verifyEmailPasswordTranslate[lang].metadata.keywords,
};

function page() {
  return <EmailVerificationPage />;
}

export default page;
