import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";

const imageSrc = (item: ProductType | undefined): string =>
  item && Array.isArray(item?.images) && item.images.length > 0
    ? item.images[0].link
    : "/products/product.png";
export default imageSrc;
