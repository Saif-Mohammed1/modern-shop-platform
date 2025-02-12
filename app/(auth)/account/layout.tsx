import { addressTranslate } from "@/app/_translate/(auth)/account/addressTranslate";
import AccountMenu from "@/components/customer/customerMaun";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: addressTranslate[lang].layout.metadata.title,
  description: addressTranslate[lang].layout.metadata.description,
  keywords: addressTranslate[lang].layout.metadata.keywords,
};
const layout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="/bg-gray-100 min-h-screen p-1 flex flex-col sm:flex-row gap-3 max-w-[1200px] mx-auto ">
      <AccountMenu />
      {children}
    </div>
  );
  // }

  // // redirect("/auth");
};

export default layout;
