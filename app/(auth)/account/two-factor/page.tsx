import TwoFactorAuthManager from "@/components/2fa/TwoFactorAuth";
import { accountTwoFactorTranslate } from "@/app/_translate/(auth)/account/twoFactorTranslate";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: accountTwoFactorTranslate[lang].metadata.title,
  description: accountTwoFactorTranslate[lang].metadata.description,
  keywords: accountTwoFactorTranslate[lang].metadata.keywords,
};
const page = () => {
  return <TwoFactorAuthManager />;
};

export default page;
