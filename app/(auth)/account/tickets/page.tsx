import { accountTicketsTranslate } from "@/public/locales/client/(auth)/account/ticketsTranslate";
import ComingSoon from "@/components/commingSoon/ComingSoon";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: accountTicketsTranslate[lang].metadata.title,
  description: accountTicketsTranslate[lang].metadata.description,
  keywords: accountTicketsTranslate[lang].metadata.keywords,
};
const page = () => {
  return <ComingSoon />;
};

export default page;
