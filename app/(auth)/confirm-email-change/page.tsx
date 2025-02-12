// export const dynamic = "force-dynamic";
import { confirmEmailChangeTranslate } from "@/app/_translate/(public)/confirmEmailChangeTranslate";
// import { emailUpdatedStatusTranslate } from "@/app/_translate/emailUpdatedStatusTranslate";
import ConfirmEmailChange from "@/components/customer/emailUpdatedStatus";
// import "@/components/customer/emailUpdatedStatus.css";
// import ErrorHandler from "@/components/Error/errorHandler";
// import api from "@/components/util/axios.api";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
// import { headers } from "next/headers";
export const metadata: Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};

const page = () => {
  return <ConfirmEmailChange />;
};
export default page;
