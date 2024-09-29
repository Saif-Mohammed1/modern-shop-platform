import { confirmEmailChangeTranslate } from "@/app/_translate/confirmEmailChangeTranslate";
import ConfirmEmailChange from "@/components/customer/emailUpdatedStatus";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
export const metadata:Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};
const page = () => {
  return <ConfirmEmailChange />;
};

export default page;
