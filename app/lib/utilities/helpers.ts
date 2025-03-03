import crypto from "crypto";

export function generateSKU(category?: string): string {
  // Generate a 4-character random alphanumeric code
  const randomCode = crypto.randomBytes(2).toString("hex").toUpperCase();

  // Get current date in YYMMDD format
  const dateCode = new Date().toISOString().slice(2, 10).replace(/-/g, "");

  // Convert category to uppercase and take first 3 letters (optional)
  const categoryCode = category ? category.slice(0, 3).toUpperCase() : "GEN";

  // Combine all parts into SKU
  return `${categoryCode}-${dateCode}-${randomCode}`;
}
export function obfuscateEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name[0]}${"*".repeat(name.length - 2)}${name.slice(-1)}@${domain}`;
}
