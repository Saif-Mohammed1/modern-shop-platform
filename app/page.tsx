export const dynamic = "force-dynamic";
import ErrorHandler from "@/components/Error/errorHandler";
import HomeComponent from "@/components/home/home";
// import AppError from "@/components/util/appError";
import api from "@/components/util/axios.api";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { rootStaticPagesTranslate } from "./_translate/rootStaticPagesTranslate";
import { lang } from "@/components/util/lang";
export const metadata: Metadata = {
  title: rootStaticPagesTranslate[lang].home.metadata.title,
  description: rootStaticPagesTranslate[lang].home.metadata.description,
  keywords: rootStaticPagesTranslate[lang].home.metadata.keywords,
};
export default async function Home() {
  try {
    const {
      data: { data },
    } = await api.get("/shop/home-page", {
      headers: Object.fromEntries(headers().entries()), // convert headers to plain object
    });
    const topOfferProducts = data.topOfferProducts;
    const newProducts = data.newProducts;
    const topRating = data.topRating;

    return (
      <HomeComponent
        topOfferProducts={topOfferProducts}
        newProducts={newProducts}
        topRating={topRating}
      />
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
}
