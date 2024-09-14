import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/footer/footer";
import NavBar from "@/components/navBar/navBar";
import Providers from "@/components/providers/providers";
import SessionExpiredOverlay from "@/components/SessionExpiredOverlay/SessionExpiredOverlay";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Awesome Online Shop",
  description:
    "Discover a wide range of products at great prices on My Awesome Online Shop. Shop now and enjoy a seamless shopping experience.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} `}>
        <Providers>
          <main className="space-y-3 p-4">
            <NavBar />
            <div className="rounded-3xl bg-red-600 text-white py-3 px-5 text-center overflow-hidden -mx-3">
              <div className="animate-marquee inline-block whitespace-nowrap">
                <p>
                  ⚠️ We are currently undergoing maintenance. Payments and user
                  actions are temporarily disabled. Please check back later.
                </p>
              </div>
            </div>

            {children}
            <Footer />
            <SessionExpiredOverlay />
          </main>
        </Providers>
        <Toaster position="top-left" />
      </body>
    </html>
  );
}
