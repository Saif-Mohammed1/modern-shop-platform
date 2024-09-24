import { dashboardTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/dashboardTranslate";
import Sidebar from "@/components/(admin)/dashboard/dashboardSideBar";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";

import { FC } from "react";
export const metadata: Metadata = {
  title: dashboardTranslate.layout.metadata[lang].title,
  description: dashboardTranslate.layout.metadata[lang].description,
  keywords: dashboardTranslate.layout.metadata[lang].keywords,
};
type LayoutProps = {
  children: React.ReactNode;
};
const layout: FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row ">
      <Sidebar />
      <div className="flex-1 p-2 sm:p-8">{children} </div>
    </div>
  );
};

export default layout;
