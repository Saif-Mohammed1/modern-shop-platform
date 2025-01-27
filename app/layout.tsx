import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navBar/navBar";
import Providers from "@/components/providers/providers";
import SessionExpiredOverlay from "@/components/SessionExpiredOverlay/SessionExpiredOverlay";
import { rootStaticPagesTranslate } from "./_translate/rootStaticPagesTranslate";
import { lang } from "@/components/util/lang";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: rootStaticPagesTranslate[lang].layout.metadata.title,
  description: rootStaticPagesTranslate[lang].layout.metadata.description,
};

export default function RootLayout({
  children,
  interceptor,
}: {
  children: React.ReactNode;
  interceptor: React.ReactNode;
}) {
  return (
    <html lang={lang}>
      <body className={`${inter.className} `}>
        <Providers>
          <main className="space-y-3 p-2 sm:p-4">
            <NavBar />
            <div className="rounded-3xl bg-red-600 text-white py-3 px-5 text-center overflow-hidden ">
              <div className="animate-marquee inline-block whitespace-nowrap">
                <p>{rootStaticPagesTranslate[lang].layout.fixed.message}</p>
              </div>
            </div>
            {interceptor}
            {children}
            <SessionExpiredOverlay />
            <Footer />
          </main>
        </Providers>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}
