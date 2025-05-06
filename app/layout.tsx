import { Inter } from "next/font/google";
import { getServerSession } from "next-auth";
import { Toaster } from "react-hot-toast";

import { lang } from "@/app/lib/utilities/lang";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navBar/navBar";
import Providers from "@/components/providers/providers";

import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: rootStaticPagesTranslate[lang].layout.metadata.title,
  description: rootStaticPagesTranslate[lang].layout.metadata.description,
  keywords: rootStaticPagesTranslate[lang].layout.metadata.keywords,
};

export default async function RootLayout({
  children,
  interceptor,
}: {
  children: React.ReactNode;
  interceptor: React.ReactNode;
}) {
  const session = await getServerSession();
  return (
    <html lang={lang ?? "en"}>
      <body className={`${inter.className} `}>
        <Providers initialSession={session}>
          <main className="space-y-3 p-2 sm:p-4">
            <NavBar />
            <div className="rounded-3xl bg-red-600 text-white py-3 px-5 text-center overflow-hidden ">
              <div className="animate-marquee inline-block whitespace-nowrap">
                <p>{rootStaticPagesTranslate[lang].layout.fixed.message}</p>
              </div>
            </div>
            {interceptor}
            {children}
            <Footer />
          </main>
        </Providers>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}
