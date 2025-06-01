import cron from "node-cron";

import logger from "./lib/logger/logs";
import type { IProductDB } from "./lib/types/products.db.types";
import { connectDB } from "./server/db/db";

// Initialize database connection once
const knex = connectDB();

// Define the async function to handle expired reservations
async function checkExpiredReservations() {
  logger.log({
    level: "info",
    message: `[CRON] Checking expired reservations at ${new Date().toISOString()}`,
  });

  try {
    await knex.transaction(async (trx) => {
      // Find expired reservations
      const expiredReservations = await trx("reservations")
        .select("product_id", "quantity")
        .where("status", "pending")
        .andWhere("expires_at", "<", trx.fn.now());

      if (expiredReservations.length === 0) {
        return;
      }

      // Restore stock for each expired reservation
      for (const { product_id, quantity } of expiredReservations) {
        await trx("products")
          .where("_id", product_id)
          .update({
            stock: trx.raw("stock + ?", [quantity]),
            reserved: trx.raw("reserved - ?", [quantity]),
          });
      }

      // Cancel expired reservations
      await trx("reservations")
        .where("status", "pending")
        .andWhere("expires_at", "<", trx.fn.now())
        .update({ status: "cancelled" });

      logger.log({
        level: "info",
        message: `[CRON] Restored and cancelled ${expiredReservations.length} reservations`,
      });
    });
  } catch (error) {
    logger.error("[CRON ERROR] Failed to restore reservations:", error);
  }
}
async function checkDiscountExpiration() {
  logger.log({
    level: "info",
    message: `[CRON] Checking expired discounts at ${new Date().toISOString()}`,
  });

  try {
    await knex.transaction(async (trx) => {
      // Find expired discounts
      const expiredDiscounts = await trx<IProductDB>("products").where(
        "discount_expire",
        "<=",
        trx.fn.now()
      );

      if (expiredDiscounts.length === 0) {
        return;
      }

      // Update status of expired discounts
      await trx<IProductDB>("products")
        .where("discount_expire", "<=", trx.fn.now())

        .update({ discount: 0, discount_expire: null });

      logger.log({
        level: "info",
        message: `[CRON] Updated ${expiredDiscounts.length} discounts to expired`,
      });
    });
  } catch (error) {
    logger.error("[CRON ERROR] Failed to update discounts:", error);
  }
}
// Schedule the cron job
cron.schedule("*/5 * * * *", () => {
  (async () => {
    await Promise.all([checkExpiredReservations(), checkDiscountExpiration()]);
  })().catch((error) => {
    logger.error("[CRON ERROR] Unhandled error in cron job:", error);
  });
});
