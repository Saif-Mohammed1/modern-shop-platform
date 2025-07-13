import crypto from "crypto";
import { setTimeout } from "timers/promises";

import type { Knex } from "knex";
import Stripe from "stripe";

import logger from "@/app/lib/logger/logs";
import { AuditAction, AuditSource } from "@/app/lib/types/audit.db.types";
import type { CartItemsType } from "@/app/lib/types/cart.db.types";
import {
  OrderStatus,
  PaymentsMethod,
  type IOrderDB,
} from "@/app/lib/types/orders.db.types";
import type {
  IProductDB,
  IProductViewBasicDB,
  IReservationDB,
} from "@/app/lib/types/products.db.types";
import {
  UserCurrency,
  UserRole,
  UserStatus,
  type IUserDB,
} from "@/app/lib/types/users.db.types";
import AppError from "@/app/lib/utilities/appError";
import { generateUUID } from "@/app/lib/utilities/id";
import { lang } from "@/app/lib/utilities/lang";
import { calculateDiscount } from "@/app/lib/utilities/priceUtils";
import { redis } from "@/app/lib/utilities/Redis";
import { stripeControllerTranslate } from "@/public/locales/server/stripeControllerTranslate";

import { connectDB } from "../db/db";
// import type { LogsTypeDto } from "../dtos/logs.dto";
import type { CreateOrderDto } from "../dtos/order.dto";
import type { ShippingInfoDto } from "../dtos/stripe.dto";

import { CartService } from "./cart.service";
import type { AdminInventoryNotification } from "./email.service";
import { OrderService } from "./order.service";
import { ProductService } from "./product.service";
import { UserService } from "./user.service";

import { emailService } from ".";

// stripe.service.ts

// export interface FailedOrderData {
//   sessionId: string;
//   user_id: string;
//   error: string;
//   metadata: any;
//   products: Array<{ product_id: string; quantity: number }>;
// }
export const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  // apiVersion: "2024-06-20",
  maxNetworkRetries: 3, // Retry 3 times on network errors
  timeout: 15_000, // 15 seconds
  typescript: true,
});

export class StripeService {
  private readonly RESERVATION_TIMEOUT;
  private readonly feePercentage;
  private readonly TAX_RATE_TTL;
  private readonly CACHE_PREFIX;
  private readonly knex = connectDB();
  constructor(
    private readonly userCartService: CartService = new CartService(),
    private readonly productService: ProductService = new ProductService(),
    private readonly userService: UserService = new UserService(),
    private readonly orderService: OrderService = new OrderService()
  ) {
    this.RESERVATION_TIMEOUT =
      Number(process.env.RESERVATION_TIMEOUT || 15) * 60; // 15 minutes in seconds
    this.feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
    this.TAX_RATE_TTL = 3600; // 1 hour in seconds
    this.CACHE_PREFIX = "taxRate:";
  }

  async createStripeSession(
    user: IUserDB,
    shipping_info: ShippingInfoDto
  ): Promise<{ sessionId: string; url: string }> {
    await this.validateEnvironment();
    const MAX_RETRIES = 3;
    let retryCount = 0;

    const BASE_URL = new URL(process.env.NEXTAUTH_URL!);
    const userCart = await this.userCartService.getMyCart(user._id.toString());

    if (userCart.length === 0) {
      throw new AppError(stripeControllerTranslate[lang].errors.cartEmpty, 400);
    }

    const { validProducts, invalidProducts } =
      await this.validateCartProducts(userCart);
    if (invalidProducts.length > 0) {
      throw new AppError(invalidProducts[0].message, 400);
    }

    const idempotencyPayload = {
      validProducts: validProducts.map((p) => ({
        id: p.product._id.toString(),
        quantity: p.quantity,
      })),
      shipping_info: this.normalizeShippingInfo(shipping_info),
      user_id: user._id.toString(),
    };
    const idempotencyKey = crypto
      .createHash("sha256")
      .update(JSON.stringify(idempotencyPayload))
      .digest("hex");

    const cachedSession = await this.getCachedSession(idempotencyKey);
    if (cachedSession) {
      return cachedSession;
    }

    // RETRY LOOP
    while (retryCount < MAX_RETRIES) {
      try {
        const result = await this.knex.transaction(async (trx) => {
          await this.reserveInventoryWithRetry(
            validProducts.map((p) => ({
              _id: p.product._id,
              quantity: p.quantity,
              name: p.product.name,
              slug: p.product.slug,
            })),
            user,
            trx
          );

          const session = await this.createStripeCheckoutSession(
            user,
            validProducts,
            shipping_info,
            BASE_URL,
            idempotencyKey
          );
          await this.cacheSession(idempotencyKey, session);

          return { sessionId: session.id, url: session.url! };
        });

        return result; // ✅ Only return after successful transaction
      } catch (error) {
        if (this.isTransientError(error)) {
          retryCount++;
          await setTimeout(50 * retryCount); // exponential backoff
          continue; // 🔁 try again
        }

        await this.handleCreateSessionError(error as Error, user);
        throw error;
      }
    }

    throw new AppError(stripeControllerTranslate[lang].errors.maxRetry, 500);
  }

  private async createStripeCheckoutSession(
    user: IUserDB,
    validProducts: Array<{ product: IProductViewBasicDB; quantity: number }>, // Now receives pre-validated products
    shipping_info: ShippingInfoDto,
    BASE_URL: URL,
    idempotencyKey: string
  ) {
    // 1. Validate shipping info
    const normalizedShippingInfo = this.normalizeShippingInfo(shipping_info);

    const texRate = await this.getTaxRate(shipping_info.country);
    // 3. Create line items with verified prices
    const lineItems = await Promise.all(
      validProducts.map((product) =>
        this.createStripeLineItem(product, texRate)
      )
    );

    // 4. Proceed with session creation
    return await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        line_items: lineItems,
        success_url: new URL("/account/orders/success", BASE_URL).toString(),
        cancel_url: new URL("/account/orders/cancel", BASE_URL).toString(),
        payment_intent_data: {
          receipt_email: user?.email,
          shipping: {
            name: user?.name ?? "Unknown",
            address: {
              line1: shipping_info.street,
              city: shipping_info.city,
              state: shipping_info.state,
              postal_code: shipping_info.postal_code,
              country: shipping_info.country,
            },
          },
        },
        invoice_creation: {
          enabled: true,
          invoice_data: {
            custom_fields: [
              {
                name: stripeControllerTranslate[lang].functions.invoiceDetails
                  .custom_fields.name,
                value:
                  stripeControllerTranslate[lang].functions.invoiceDetails
                    .custom_fields.value,
              },
            ],
            description:
              stripeControllerTranslate[lang].functions.invoiceDetails
                .description,
            footer:
              stripeControllerTranslate[lang].functions.invoiceDetails.footer +
              process.env.COMPANY_MAIL,
            // You can add other fields as needed
          },
        },

        metadata: {
          shipping_info: JSON.stringify(normalizedShippingInfo),
          idempotencyKey,
          reservationTimeout: Date.now() + this.RESERVATION_TIMEOUT * 1000,
        },
      }
      // { idempotencyKey }
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    await this.knex.transaction(async (trx) => {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
            trx
          );
          break;
        case "charge.refunded":
          await this.handleChargeRefunded(
            event.data.object as Stripe.Charge,
            trx
          );
          break;
      }
    });
  }
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    trx: Knex.Transaction
  ): Promise<void> {
    const lockKey = `order:${session.id}`;
    const locked = await this.acquireLock(lockKey);
    if (!locked) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.ConcurrentOrder,

        409
      );
    }

    // Validate session metadata
    if (!session.metadata?.shipping_info || !session.metadata?.idempotencyKey) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.InvalidMetadata,
        400
      );
    }
    // Retrieve user and shipping info

    const user = await this.userService.findUserById(
      session.client_reference_id as string,
      trx
    );
    if (!user) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.noUserExist,
        404
      );
    }
    try {
      // Parse shipping information
      const shipping_info = this.parseShippingInfo(
        session.metadata.shipping_info
      );
      // Retrieve Stripe invoice and line items
      const [lineItems, invoice] = await Promise.all([
        stripe.checkout.sessions.listLineItems(session.id, {
          expand: ["data.price.product"],
        }),
        stripe.invoices.retrieve(session.invoice as string),
      ]);

      // Create order items
      const orderItems = await this.processOrderItems(lineItems.data, trx);

      // Create order document
      await this.createOrderFromSession(
        session,
        user,
        shipping_info,
        trx,
        orderItems,
        invoice
      );
      // Update inventory and clear cart
      await this.updateInventory(orderItems, user, trx);
      // await this.cartService.clearCart(user._id.toString(), transaction);

      // Send order confirmation
      // await this.sendOrderConfirmation(user, order, transaction);
      await emailService.sendEmailWithInvoice(
        user.email,

        invoice.invoice_pdf!,
        invoice.id!,
        new Date(invoice.created * 1000).toLocaleDateString()
      );
      // // Audit log
      // await this.createAuditLog(
      //   user._id,
      //   AuditAction.ORDER_CREATED,
      //   EntityType.ORDER,
      //   order[0]._id.toString(),
      //   { stripeSessionId: session.id },
      //   transaction
      // );
    } catch (error) {
      await this.handleOrderFailure(user, error as Error);
      throw error;
    } finally {
      await this.releaseLock(lockKey);
    }
  }
  private async handleChargeRefunded(
    charge: Stripe.Charge,
    trx: Knex.Transaction
  ): Promise<void> {
    const order = await trx<IOrderDB>("orders")
      .whereRaw(`payment->>'transaction_id' = ?`, [charge.payment_intent])
      .first();

    if (!order) {
      return;
    }

    order.status = charge.refunded
      ? OrderStatus.Refunded
      : OrderStatus.PartiallyRefunded;
    await trx("orders")
      .update({ status: order.status })
      .where("_id", order._id);

    await this.orderService.createAuditLog(
      AuditAction.ORDER_UPDATED,
      order._id.toString(),
      String(charge.metadata.user_id),
      [],
      {
        status: order.status,
        refundAmount: charge.amount_refunded / 100,
        currency: charge.currency,
      },
      AuditSource.WEB,
      trx
    );
  }

  private async updateInventory(
    orderItems: CreateOrderDto["items"],
    user: IUserDB,
    trx: Knex.Transaction
  ): Promise<void> {
    await Promise.all(
      orderItems.map(async (item) => {
        const affectedRows = await trx<IProductDB>("products")
          .where("_id", item.product_id)
          .update({
            stock: this.knex.raw("stock - ?", [item.quantity]),
            reserved: this.knex.raw("reserved - ?", [item.quantity]),
            sold: this.knex.raw("sold + ?", [item.quantity]),
            last_modified_by: user._id,
          });

        if (affectedRows === 0) {
          throw new AppError(
            `Failed to update inventory for product ${item.name}`,
            500
          );
        }
        await trx<IReservationDB>("reservations")
          .where("product_id", item.product_id)
          .andWhere("user_id", user._id)
          .andWhere("status", "pending")
          .update({ status: "confirmed" });
      })
    );
  }
  private async processOrderItems(
    items: Stripe.LineItem[],
    trx: Knex.Transaction
  ): Promise<CreateOrderDto["items"]> {
    return await Promise.all(
      items.map(async (item) => {
        const productMetadata = (item?.price?.product as Stripe.Product)
          .metadata; // Assuming you stored _id in metadata
        const query = trx ?? this.knex;
        const product = await query<IProductViewBasicDB>(
          "public_products_views_basic"
        )
          .where("_id", productMetadata._id)
          .first();

        if (!product) {
          throw new AppError(
            stripeControllerTranslate[lang].errors.notFoundProduct(
              productMetadata.name
            ),
            404
          );
        }
        // throw new AppError(`Product not found: ${productMetadata.name}`, 404);

        return {
          product_id: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          quantity: item.quantity || 0,
          sku: product.sku,
          shipping_info: {
            weight: product.shipping_info.weight || 0,
            dimensions: product.shipping_info.dimensions || {
              length: 0,
              width: 0,
              height: 0,
            },
          },
          final_price: this.calculateFinalPrice(product, item.quantity || 1),
        };
      })
    );
  }
  private async createOrderFromSession(
    session: Stripe.Checkout.Session,
    user: IUserDB,
    shipping_info: ShippingInfoDto,
    trx: Knex.Transaction,
    orderItems: CreateOrderDto["items"],
    invoice: Stripe.Invoice
  ) {
    try {
      await this.orderService.createOrder(
        {
          user_id: user._id,
          items: orderItems,
          shipping_address: shipping_info,
          payment: {
            method: PaymentsMethod.Credit_card, // Map from Stripe payment method
            transaction_id: session.payment_intent as string,
          },
          status: OrderStatus.Processing,
          invoice_id: invoice.id,
          invoice_link: invoice.invoice_pdf || "",
          subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
          tax: session.total_details?.amount_tax
            ? session.total_details.amount_tax / 100
            : 0,
          total: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || UserCurrency.UAH,
        },
        trx
      );
    } catch (error) {
      await this.handleOrderFailure(user, error as Error);

      throw error;
    }
  }
  private async handleOrderFailure(user: IUserDB, error: Error) {
    await this.orderService.createAuditLog(
      AuditAction.ORDER_FAILURE,
      "N/A",
      user._id,
      [],
      {
        error: error.message,
        stack: error.stack,
      }
    );
  }

  private async reserveInventoryWithRetry(
    products: Array<{
      _id: string;
      quantity: number;
      name: string;
      slug: string;
    }>,
    user: IUserDB,
    // logs: LogsTypeDto,
    trx: Knex.Transaction,
    maxRetries = 5
  ): Promise<void> {
    // Sort products by ID to prevent deadlocks
    const sortedProducts = [...products].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString())
    );

    const lockKeys = sortedProducts.map(
      (p) => `product_lock:${p._id.toString()}`
    );
    const acquiredLocks: string[] = [];

    try {
      // Acquire all locks with retries
      for (const [index, lockKey] of lockKeys.entries()) {
        let attempts = 0;
        while (attempts < maxRetries) {
          const acquired = await this.acquireLock(lockKey, 60); // 60 second TTL

          if (acquired) {
            acquiredLocks.push(lockKey);
            break;
          }

          attempts++;
          const delay = Math.min(100 * 2 ** attempts, 6000);
          await setTimeout(delay);

          if (attempts === maxRetries) {
            throw new AppError(
              stripeControllerTranslate[lang].errors.acquireLock(
                sortedProducts[index]._id.toString(),
                maxRetries
              ),
              409
            );
          }
        }
      }

      // Proceed with inventory reservation after acquiring all locks
      await this.reserveInventory(sortedProducts, user, trx);
    } finally {
      // Release all locks in reverse order
      for (const lockKey of [...acquiredLocks].reverse()) {
        await this.releaseLock(lockKey).catch((error) => {
          logger.error(`Failed to release lock: ${lockKey}`, error);
        });
      }
    }
  }

  private async handleCreateSessionError(
    error: Error,
    user: IUserDB
  ): Promise<void> {
    await this.orderService.createAuditLog(
      AuditAction.CHECKOUT_FAILURE,
      "N/A",
      user._id.toString(),
      [],
      {
        error: error.message,
        user_id: user._id.toString(),
        stack: error.stack,
      }
    );
  }
  private async reserveInventory(
    products: Array<{
      _id: string;
      quantity: number;
      name: string;
      slug: string;
    }>,
    user: IUserDB,
    trx: Knex.Transaction
  ): Promise<void> {
    const productMap = new Map<
      string,
      { totalQuantity: number; name: string; slug: string }
    >();
    products.forEach(({ _id, quantity, name, slug }) => {
      const product_id = _id.toString();
      const existing = productMap.get(product_id);
      if (existing) {
        existing.totalQuantity += quantity;
      } else {
        productMap.set(product_id, { totalQuantity: quantity, name, slug });
      }
    });

    const reservationPromises = Array.from(productMap.entries()).map(
      async ([product_id, { totalQuantity, name, slug }]) => {
        // Check stock availability
        const product = await trx<IProductDB>("products")
          .where("_id", product_id)
          .andWhere(this.knex.raw("(stock - reserved) >= ?", [totalQuantity]))
          .first();

        if (!product) {
          return { product_id, success: false, name, slug };
        }

        // Insert reservation record
        await trx<IReservationDB>("reservations").insert({
          _id: generateUUID(),
          user_id: user._id,
          product_id,
          quantity: totalQuantity,
          // created_at: new Date(),
          expires_at: new Date(Date.now() + this.RESERVATION_TIMEOUT * 1000),
          status: "pending",
        });

        // Update reserved column in products table
        const affectedRows = await trx<IProductDB>("products")
          .where("_id", product_id)
          .update({
            reserved: this.knex.raw("reserved + ?", [totalQuantity]),
            last_modified_by: user._id,
          });

        return { product_id, success: affectedRows > 0, name, slug };
      }
    );

    const updateResults = await Promise.all(reservationPromises);
    const failedProducts = updateResults
      .filter((result) => !result.success)
      .map((result) => ({
        _id: result.product_id,
        quantity: productMap.get(result.product_id)?.totalQuantity ?? 0,
        name: result.name,
        slug: result.slug,
      }));

    if (failedProducts.length > 0) {
      await this.handlePartialReservationFailure(user, failedProducts);
      throw new AppError(
        stripeControllerTranslate[lang].errors.PartialReservation(
          failedProducts.length
        ),
        409
      );
    }
  }
  // private async reserveInventory(
  //   products: Array<{
  //     _id: string;
  //     quantity: number;
  //     name: string;
  //     slug: string;
  //   }>,
  //   user: IUserDB,
  //   trx: Knex.Transaction
  // ): Promise<void> {
  //   const productMap = new Map<
  //     string,
  //     { totalQuantity: number; name: string; slug: string }
  //   >();
  //   products.forEach(({ _id, quantity, name, slug }) => {
  //     const product_id = _id.toString();
  //     const existing = productMap.get(product_id);
  //     if (existing) {
  //       existing.totalQuantity += quantity;
  //     } else {
  //       productMap.set(product_id, { totalQuantity: quantity, name, slug });
  //     }
  //   });

  //   const updateResults = await Promise.all(
  //     Array.from(productMap.entries()).map(
  //       async ([product_id, { totalQuantity }]) => {
  //         const affectedRows = await trx<IProductDB>("products")
  //           .where("_id", product_id)
  //           .andWhere(this.knex.raw("(stock - reserved) >= ?", [totalQuantity]))
  //           .update({
  //             reserved: this.knex.raw("reserved + ?", [totalQuantity]),
  //             last_modified_by: user._id,
  //           });
  //         return { product_id, success: affectedRows > 0 };
  //       }
  //     )
  //   );

  //   const failedProducts = updateResults
  //     .filter((result) => !result.success)
  //     .map((result) => ({
  //       _id: result.product_id,
  //       quantity: productMap.get(result.product_id)?.totalQuantity ?? 0,
  //       name: productMap.get(result.product_id)?.name ?? "",
  //       slug: productMap.get(result.product_id)?.slug ?? "",
  //     }));

  //   if (failedProducts.length > 0) {
  //     await this.handlePartialReservationFailure(user, failedProducts);
  //     throw new AppError(
  //       stripeControllerTranslate[lang].errors.PartialReservation(
  //         failedProducts.length
  //       ),
  //       409
  //     );
  //   }
  // }
  private async handlePartialReservationFailure(
    user: IUserDB,
    failedProducts: Array<{
      _id: string;
      quantity: number;
      name: string;
      slug: string;
    }>
    // logs: LogsTypeDto
  ): Promise<void> {
    // 1. Log audit entry

    await this.productService.createLogs(
      AuditAction.INVENTORY_RESERVATION_PARTIAL,
      "BATCH_UPDATE",
      user._id,
      failedProducts.map((p) => ({
        field: "reserved",
        before: " ",
        after: p.quantity,
        // productName: p.name,
        change_type: "MODIFY",
      }))
      // logs.ipAddress,
      // logs.userAgent
    );

    // 2. Notify admins
    // Get admins with proper typing and security
    const admins = await this.knex("users")
      .where("role", UserRole.ADMIN)
      .where("status", UserStatus.ACTIVE)
      .select("email");

    const notification: AdminInventoryNotification = {
      type: "INVENTORY_RESERVATION_PARTIAL",
      user_id: user._id.toString(),
      failedProducts: failedProducts.map((p) => ({
        product_id: p._id.toString(),
        productName: p.name, // Add product name from your Product model
        quantity: p.quantity,
      })),
      timestamp: new Date(),
    };

    await emailService.sendAdminNotification(admins, notification);
  }
  private parseShippingInfo(shipping_info: string): ShippingInfoDto {
    try {
      return JSON.parse(shipping_info) as ShippingInfoDto;
    } catch (_e) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.InvalidShipping,

        400
      );
    }
  }
  private calculateFinalPrice(
    product: IProductViewBasicDB,
    quantity: number
  ): number {
    const { discountedPrice } = calculateDiscount(product);
    // product.discount_expire && product.discount_expire > new Date()
    //   ? product.price - (product.discount || 0)
    //   : product.price;

    return Number((discountedPrice * quantity).toFixed(2));
  } // Distributed locking functions
  private async acquireLock(
    key: string,
    ttl: number = this.RESERVATION_TIMEOUT
  ): Promise<boolean> {
    const result = await redis.set(key, "locked", {
      nx: true, // Only set if not exists
      ex: ttl, // Set expiration
    });
    return result === "OK";
  }

  private async releaseLock(key: string) {
    await redis.del(key);
  }
  private async validateEnvironment() {
    if (!process.env.NEXTAUTH_URL) {
      throw new AppError("NEXTAUTH_URL environment variable is required", 500);
    }
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch (_e) {
      throw new AppError("Invalid NEXTAUTH_URL format", 500);
    }
  }
  async getCachedSession(
    idempotencyKey: string
  ): Promise<{ sessionId: string; url: string } | null> {
    const cachedSession = await redis.get<any>(idempotencyKey);
    if (cachedSession) {
      // Handle both string and object cases
      if (typeof cachedSession === "string") {
        return JSON.parse(cachedSession) as {
          sessionId: string;
          url: string;
        };
      }
      return cachedSession as { sessionId: string; url: string };
    }
    return null;
  }
  async cacheSession(idempotencyKey: string, session: Stripe.Checkout.Session) {
    await redis.set(
      idempotencyKey,
      JSON.stringify({ sessionId: session.id, url: session.url! }),
      {
        ex: this.RESERVATION_TIMEOUT,
      }
    );
  }

  private async getTaxRate(country: string): Promise<string> {
    const countryCode = country.toUpperCase();
    const cacheKey = `${this.CACHE_PREFIX}${countryCode}`;

    // Check cache with lock to prevent race conditions
    const lockKey = `taxrate:${countryCode}:lock`;
    const locked = await this.acquireLock(lockKey, 5);

    try {
      if (locked) {
        const cachedId = await redis.get<string>(cacheKey);
        if (cachedId) {
          return cachedId;
        }

        const taxRate = await stripe.taxRates.create({
          display_name: "Sales Tax",
          description: `${this.feePercentage}% Tax`,
          jurisdiction: countryCode,
          percentage: this.feePercentage,
          inclusive: false,
        });
        await redis.setex(cacheKey, this.TAX_RATE_TTL, taxRate.id);
        return taxRate.id;
      }
      // Wait and retry if another process is creating the tax rate
      await setTimeout(100);
      return this.getTaxRate(country);
    } finally {
      if (locked) {
        await this.releaseLock(lockKey);
      }
    }
  }
  private async validateCartProducts(cartItems: CartItemsType[]) {
    const productIds = cartItems.map((item) => item._id);
    // 1. Bulk fetch with fresh data
    const products = await this.knex<IProductViewBasicDB>(
      "public_products_views_basic"
    )
      .where("stock", ">", 1)
      .whereIn("_id", productIds);
    // 2. Create validation map
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    // 3. Validate each cart item
    const results = {
      validProducts: [] as Array<{
        product: IProductViewBasicDB;
        quantity: number;
      }>,
      invalidProducts: [] as Array<{
        name: string;
        _id: string;
        message: string;
      }>,
    };

    for (const item of cartItems) {
      const product = productMap.get(item._id.toString());

      if (!product) {
        results.invalidProducts.push({
          name: item.name,
          _id: item._id,
          message: stripeControllerTranslate[
            lang
          ].functions.createStripeProduct.productNotAvailableAnymore(item.name),
          // message: `Product ${item.name} is no longer available`,
        });
        continue;
      }
      const availableStock = product.stock - (product.reserved ?? 0);
      if (availableStock < item.quantity) {
        results.invalidProducts.push({
          name: item.name,
          _id: item._id,
          message: stripeControllerTranslate[lang].errors.InsufficientStock(
            item.name,
            availableStock
          ),
        });
        continue;
      }

      // 4. Price validation
      const { discountedPrice: currentPrice } = calculateDiscount(product);
      const { discountedPrice: currentItemPrice } = calculateDiscount(item);

      if (currentPrice !== currentItemPrice) {
        results.invalidProducts.push({
          name: item.name,
          _id: item._id,
          message: stripeControllerTranslate[lang].errors.priceMismatch(
            item.name
          ),
        });
        continue;
      }

      results.validProducts.push({
        product: product,
        quantity: item.quantity,
      });
    }

    return results;
  }

  private async createStripeLineItem(
    item: { product: IProductViewBasicDB; quantity: number },
    taxRate: string
  ) {
    const { discountedPrice } = calculateDiscount(item.product);
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product.name,
          images: item.product.images.slice(0, 1).map((img) => img.link),
          metadata: {
            _id: item.product._id.toString(),
            sku: item.product.sku,
            name: item.product.name,
          },
        },
        unit_amount: Math.round(discountedPrice * 100),
      },
      quantity: item.quantity,
      tax_rates: [taxRate],
    };
  }

  private normalizeShippingInfo(
    shipping_info: ShippingInfoDto
  ): ShippingInfoDto {
    return {
      street: shipping_info.street.trim(),
      city: shipping_info.city.trim(),
      state: shipping_info.state.trim(),
      postal_code: shipping_info.postal_code.trim(),
      country: shipping_info.country.trim(),
      phone: shipping_info.phone.trim(),
    };
  }

  private isTransientError(error: any): boolean {
    const { code } = error as any;
    return code === "lock_timeout" || code === "deadlock_detected";
  }
}
