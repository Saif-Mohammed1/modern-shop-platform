import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navBar/navBar";
import Providers from "@/components/providers/providers";
import SessionExpiredOverlay from "@/components/SessionExpiredOverlay/SessionExpiredOverlay";
import { rootStaticPagesTranslate } from "../public/locales/client/(public)/rootStaticPagesTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { getServerSession } from "next-auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: rootStaticPagesTranslate[lang].layout.metadata.title,
  description: rootStaticPagesTranslate[lang].layout.metadata.description,
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
    <html lang={lang}>
      <body className={`${inter.className} `}>
        <Providers session={session}>
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
