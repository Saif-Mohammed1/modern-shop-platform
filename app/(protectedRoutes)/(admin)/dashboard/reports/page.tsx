import { reportsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/reportsTranslate";
import ComingSoon from "@/components/commingSoon/ComingSoon";
import { lang } from "@/components/util/lang";
export const metadata = {
  title: reportsTranslate.metadata[lang].title,
  description: reportsTranslate.metadata[lang].description,
  keywords: reportsTranslate.metadata[lang].keywords,
};
const page = () => {
  return <ComingSoon />;
};

export default page;
