import { accountDashboardTranslate } from "@/app/_translate/(auth)/account/dashboardTranslate";
import AccountDashboard from "@/components/customer/accountDashboard";
import { lang } from "@/app/lib/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: accountDashboardTranslate[lang].metadata.title,
  description: accountDashboardTranslate[lang].metadata.description,
  keywords: accountDashboardTranslate[lang].metadata.keywords,
};
const page = () => {
  return <AccountDashboard />;
};

export default page;
