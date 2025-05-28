import knex, { type Knex } from "knex";

import AppError from "@/app/lib/utilities/appError";
import config from "@/knexfile";

// Extend NodeJS global type to include knexInstance
declare global {
  // eslint-disable-next-line no-var
  var knexInstance: Knex | undefined;
}

// Initialize cached connection
let cachedDb: Knex | null = global.knexInstance || null;

const connectDB = (): Knex => {
  if (!cachedDb) {
    try {
      cachedDb = knex(config.development);
      // Save to global to prevent multiple instances in development
      global.knexInstance = cachedDb;
    } catch (_error) {
      throw new AppError("Failed to connect to database", 500);
    }
  }
  return cachedDb;
};

export { connectDB };
