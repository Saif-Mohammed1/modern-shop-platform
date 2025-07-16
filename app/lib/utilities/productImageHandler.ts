import type { ProductType } from "@/app/lib/types/products.types";

const imageSrc = (item: Pick<ProductType, "images"> | undefined): string =>
  item && Array.isArray(item?.images) && item.images.length > 0
    ? item.images[0].link
    : "/products/product.png";

export default imageSrc;
