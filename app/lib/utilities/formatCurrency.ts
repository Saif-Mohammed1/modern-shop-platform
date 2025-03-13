// lib/utils/formatCurrency.ts
interface FormatCurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(amount);
}

// Optional helper functions for common currencies
export const formatUSD = (amount: number) =>
  formatCurrency(amount, { currency: "USD" });
export const formatEUR = (amount: number) =>
  formatCurrency(amount, { currency: "EUR" });
export const formatGBP = (amount: number) =>
  formatCurrency(amount, { currency: "GBP" });
export const formatJPY = (amount: number) =>
  formatCurrency(amount, {
    currency: "JPY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
export const formatUAH = (amount: number) =>
  formatCurrency(amount, { currency: "UAH" });
