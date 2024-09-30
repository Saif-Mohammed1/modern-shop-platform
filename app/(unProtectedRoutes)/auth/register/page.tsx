import { registerTranslate } from "@/app/_translate/auth/registerTranslate";
import RegisterPage from "@/components/authentication/register";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: registerTranslate[lang].metadata.title,
  description: registerTranslate[lang].metadata.description,
  keywords: registerTranslate[lang].metadata.keywords,
};

const page = () => {
  return <RegisterPage />;
};

export default page;
