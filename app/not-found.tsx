// import NotFoundComponent from "@/components/notFound/notFound";
import dynamic from "next/dynamic";
import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
const NotFoundComponent = dynamic(
  () => import("@/components/notFound/notFound")
);
export const metadata: Metadata = {
  title: rootStaticPagesTranslate[lang].notFound.metadata.title,
  description: rootStaticPagesTranslate[lang].notFound.metadata.description,
  keywords: rootStaticPagesTranslate[lang].notFound.metadata.keywords,
};
export default function NotFound() {
  return (
    <div>
      <NotFoundComponent />
    </div>
  );
}
