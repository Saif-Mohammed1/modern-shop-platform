// utils/priceUtils.ts

import type { ProductType } from "../types/products.types";

export interface PriceCalculation {
  originalPrice: number;
  discountedPrice: number;
  isDiscountValid: boolean;
  discountPercentage: number;
}

export const calculateDiscount = (
  item: Pick<ProductType, "price" | "discount" | "discountExpire">
): PriceCalculation => {
  const now = new Date();
  const expireDate =
    item.discountExpire instanceof Date
      ? item.discountExpire
      : new Date(item.discountExpire || "");

  const isDiscountValid =
    !!item.discount &&
    !!item.discountExpire &&
    !isNaN(expireDate.getTime()) &&
    expireDate > now;

  const discountedPrice = (
    isDiscountValid ? item.price - item.discount! : item.price
  ).toFixed(2);
  const discountedPriceNumber = parseFloat(discountedPrice);

  const discountPercentage = isDiscountValid
    ? Math.round((item.discount! / item.price) * 100)
    : 0;

  return {
    originalPrice: item.price,
    discountedPrice: discountedPriceNumber,
    isDiscountValid,
    discountPercentage,
  };
};
