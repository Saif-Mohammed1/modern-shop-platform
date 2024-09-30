import { forgetPasswordTranslate } from "@/app/_translate/auth/forgetPasswordTranslate";
import ForgotPasswordPage from "@/components/authentication/forgetPassword";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: forgetPasswordTranslate[lang].metadata.title,
  description: forgetPasswordTranslate[lang].metadata.description,

  keywords: forgetPasswordTranslate[lang].metadata.keywords,
};

const page = () => {
  return <ForgotPasswordPage />;
};

export default page;
