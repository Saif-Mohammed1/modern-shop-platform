import {lang} from '@/app/lib/utilities/lang';
import AddProduct from '@/components/(admin)/dashboard/products/addProduct';
import {productsTranslate} from '@/public/locales/client/(auth)/(admin)/dashboard/productTranslate';

export const metadata = {
  title: productsTranslate.products[lang].addProduct.metadata.title,
  description: productsTranslate.products[lang].addProduct.metadata.description,
  keywords: productsTranslate.products[lang].addProduct.metadata.keywords,
};
const page = () => {
  return <AddProduct />;
};

export default page;
