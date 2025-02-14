import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";
import ResetPasswordPage from "@/components/authentication/resetPassword";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: resetPasswordTranslate[lang].metadata.title,
  description: resetPasswordTranslate[lang].metadata.description,
  keywords: resetPasswordTranslate[lang].metadata.keywords,
};

const page = () => {
  // Add your component logic here

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <ResetPasswordPage />
    </div>
  );
};

export default page;
