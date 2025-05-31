// ./app/not-found.tsx
// import NotFoundComponent from "@/components/notFound/notFound";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import { lang } from "@/app/lib/utilities/lang";
// import NotFoundComponent from "@/components/notFound/notFound";

import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";

const NotFoundComponent = dynamic(
  () => import("@/components/notFound/notFound"),
  {
    ssr: false, // ⛔ Prevent server-side rendering to avoid build crash
  }
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
