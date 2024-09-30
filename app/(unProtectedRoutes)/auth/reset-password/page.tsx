import { resetPasswordTranslate } from "@/app/_translate/auth/resetPasswordTranslate";
import ResetPasswordPage from "@/components/authentication/resetPassword";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: resetPasswordTranslate[lang].metadata.title,
  description: resetPasswordTranslate[lang].metadata.description,
  keywords: resetPasswordTranslate[lang].metadata.keywords,
};

const page = () => {
  // Add your component logic here

  return <ResetPasswordPage />;
};

export default page;
