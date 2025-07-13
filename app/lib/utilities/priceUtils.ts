// utils/priceUtils.ts

import type { ProductType } from "../types/products.types";

export interface PriceCalculation {
  originalPrice: number;
  discountedPrice: number;
  isDiscountValid: boolean;
  discountPercentage: number;
}

export const calculateDiscount = (
  item: Pick<ProductType, "price" | "discount" | "discount_expire">
): PriceCalculation => {
  const now = new Date();
  const expireDate =
    item.discount_expire instanceof Date
      ? item.discount_expire
      : new Date(item.discount_expire || "");

  const isDiscountValid =
    !!item.discount &&
    !!item.discount_expire &&
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
