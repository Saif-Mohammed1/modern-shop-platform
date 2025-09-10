// utils/priceUtils.ts

export interface PriceCalculation {
  originalPrice: number;
  discountedPrice: number;
  isDiscountValid: boolean;
  discountPercentage: number;
}

export const calculateDiscount = (item: {
  price: number;
  discount?: number;
  discount_expire?: Date | string;
}): PriceCalculation => {
  const now = new Date();

  // Check if discount exists and is a valid positive number
  const hasValidDiscount =
    item.discount !== null && item.discount !== undefined && item.discount > 0;

  // Check if discount expiration exists and is a valid future date
  let hasValidExpiration = false;
  let expireDate: Date | null = null;

  if (item.discount_expire) {
    expireDate =
      item.discount_expire instanceof Date
        ? item.discount_expire
        : new Date(item.discount_expire);

    hasValidExpiration = !isNaN(expireDate.getTime()) && expireDate > now;
  }

  // Discount is only valid if BOTH discount amount and expiration exist and are valid
  const isDiscountValid = hasValidDiscount && hasValidExpiration;

  const discountedPrice = isDiscountValid
    ? Math.max(0, item.price - item.discount!) // Ensure price never goes below 0
    : item.price;

  const discountPercentage = isDiscountValid
    ? Math.round((item.discount! / item.price) * 100)
    : 0;

  return {
    originalPrice: item.price,
    discountedPrice: parseFloat(discountedPrice.toFixed(2)),
    isDiscountValid,
    discountPercentage,
  };
};
