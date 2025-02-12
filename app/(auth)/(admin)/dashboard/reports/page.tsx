import { reportsTranslate } from "@/app/_translate/(auth)/(admin)/dashboard/reportsTranslate";
import ComingSoon from "@/components/commingSoon/ComingSoon";
import { lang } from "@/app/lib/util/lang";
export const metadata = {
  title: reportsTranslate.metadata[lang].title,
  description: reportsTranslate.metadata[lang].description,
  keywords: reportsTranslate.metadata[lang].keywords,
};
const page = () => {
  return <ComingSoon />;
};

export default page;
