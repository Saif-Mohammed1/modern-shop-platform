import { verifyEmailPasswordTranslate } from "@/app/_translate/(public)/auth/verifyEmailPasswordTranslate copy";
import EmailVerificationPage from "@/components/authentication/_emailVerification";
import { lang } from "@/app/lib/util/lang";
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
