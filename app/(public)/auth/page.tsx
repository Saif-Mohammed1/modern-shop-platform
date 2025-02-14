import { loginTranslate } from "@/public/locales/client/(public)/auth/loginTranslate";
import LoginPage from "@/components/authentication/login";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: loginTranslate[lang].Metadata.title,
  description: loginTranslate[lang].Metadata.description,
  keywords: loginTranslate[lang].Metadata.keywords,
};

const page = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <LoginPage />
    </div>
  );
};

export default page;
