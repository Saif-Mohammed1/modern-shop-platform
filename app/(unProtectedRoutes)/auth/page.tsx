import { loginTranslate } from "@/app/_translate/auth/loginTranslate";
import LoginPage from "@/components/authentication/login";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: loginTranslate[lang].Metadata.title,
  description: loginTranslate[lang].Metadata.description,
  keywords: loginTranslate[lang].Metadata.keywords,
};

const page = () => {
  return <LoginPage />;
};

export default page;
