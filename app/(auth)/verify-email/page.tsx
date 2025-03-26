import { lang } from "@/app/lib/utilities/lang";
import VerifyEmail from "@/components/ui/VerifyEmail";
import { VerifyEmailTranslate } from "@/public/locales/client/(auth)/VerifyEmail.Translate";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: VerifyEmailTranslate[lang].metadata.title,
  description: VerifyEmailTranslate[lang].metadata.description,
  keywords: VerifyEmailTranslate[lang].metadata.keywords,
};
const page = () => <VerifyEmail />;

export default page;
