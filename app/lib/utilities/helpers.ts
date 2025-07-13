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
// export const generateSlug = (name: string): string => {
//   // Convert to lowercase
//   const lowerCaseName = name.toLowerCase();
//   // Replace spaces with hyphens
//   const hyphenatedName = lowerCaseName.replace(/\s+/g, "-");
//   // Remove special characters
//   const sanitizedSlug = hyphenatedName.replace(/[^a-z0-9-]/g, "");
//   // Remove consecutive hyphens
//   const cleanedSlug = sanitizedSlug.replace(/--+/g, "-");
//   // Trim hyphens from start and end
//   const trimmedSlug = cleanedSlug.replace(/^-+|-+$/g, "");
//   // Add a timestamp to ensure uniqueness
//   const timestamp = Date.now();
//   // Combine the cleaned slug with the timestamp
//   const uniqueSlug = `${trimmedSlug}-${timestamp}`;
//   return uniqueSlug;
// };
export function obfuscateEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name[0]}${"*".repeat(name.length - 2)}${name.slice(-1)}@${domain}`;
}
import type { Knex } from "knex";

// Utility to normalize and clean the slug
const normalizeSlug = (name: string): string => {
  // Convert to lowercase and normalize unicode characters (e.g., café → cafe)
  const normalized = name
    .toLowerCase()
    .normalize("NFD") // Decompose accents (e.g., é → e + combining mark)
    .replace(/[\u0300-\u036f]/g, ""); // Remove combining marks

  // Replace spaces and special characters with hyphens
  let slug = normalized
    .replace(/[\s_]+/g, "-") // Spaces or underscores to hyphens
    .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric except hyphens
    .replace(/-+/g, "-") // Collapse multiple hyphens
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing hyphens

  // Truncate to 100 characters to keep URLs manageable
  slug = slug.slice(0, 100);

  // Ensure the slug isn’t empty
  return slug || "product"; // Fallback if name is all special characters
};

// Generate a unique slug with database check
export const generateSlug = async (
  name: string,
  knex: Knex,
  tableName: string = "products"
): Promise<string> => {
  const baseSlug = normalizeSlug(name);

  // Check if the base slug exists in the database
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await knex(tableName)
      .where({ slug })
      .select("slug")
      .first();

    if (!existing) {
      break; // Slug is unique, use it
    }

    // Append counter for uniqueness (e.g., product-name-2)
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
