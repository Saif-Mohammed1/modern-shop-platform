import {lang} from '@/app/lib/utilities/lang';
import ComingSoon from '@/components/commingSoon/ComingSoon';
import {reportsTranslate} from '@/public/locales/client/(auth)/(admin)/dashboard/reportsTranslate';

export const metadata = {
  title: reportsTranslate.metadata[lang].title,
  description: reportsTranslate.metadata[lang].description,
  keywords: reportsTranslate.metadata[lang].keywords,
};
const page = () => {
  return <ComingSoon />;
};

export default page;
