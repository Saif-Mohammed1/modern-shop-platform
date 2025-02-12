import { forgetPasswordTranslate } from "@/app/_translate/(public)/auth/forgetPasswordTranslate";
import ForgotPasswordPage from "@/components/authentication/forgetPassword";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: forgetPasswordTranslate[lang].metadata.title,
  description: forgetPasswordTranslate[lang].metadata.description,

  keywords: forgetPasswordTranslate[lang].metadata.keywords,
};

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ForgotPasswordPage />
    </div>
  );
};

export default page;
