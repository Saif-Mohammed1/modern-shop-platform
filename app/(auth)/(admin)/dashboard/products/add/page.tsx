import { productsTranslate } from "@/app/_translate/(auth)/(admin)/dashboard/productTranslate";
import AddProduct from "@/components/(admin)/dashboard/products/addProduct/addProduct";
import { lang } from "@/app/lib/util/lang";
export const metadata = {
  title: productsTranslate.products[lang].addProduct.metadata.title,
  description: productsTranslate.products[lang].addProduct.metadata.description,
  keywords: productsTranslate.products[lang].addProduct.metadata.keywords,
};
const page = () => {
  return <AddProduct />;
};

export default page;
