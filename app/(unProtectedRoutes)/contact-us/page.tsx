import { contactUsTranslate } from "@/app/_translate/contactUsTranslate";
import ContactUs from "@/components/contact-us/contact-us";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: contactUsTranslate[lang].metadata.title, // Update the title here
  description: contactUsTranslate[lang].metadata.description, // Update the description here
  keywords: contactUsTranslate[lang].metadata.keywords,
  // Update the keywords here
};

const page = () => {
  return <ContactUs />;
};

export default page;
