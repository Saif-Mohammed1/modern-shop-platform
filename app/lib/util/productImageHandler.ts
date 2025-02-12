import { ProductType } from "@/app/lib/types/products.types";
const imageSrc = (item: ProductType | undefined): string =>
  item && Array.isArray(item?.images) && item.images.length > 0
    ? item.images[0].link
    : "/products/product.png";
export default imageSrc;
