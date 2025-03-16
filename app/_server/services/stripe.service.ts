import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { redis } from "@/app/lib/utilities/Redis";
import { stripeControllerTranslate } from "@/public/locales/server/stripeControllerTranslate";
import mongoose from "mongoose";
import Stripe from "stripe";
import UserModel, { IUser } from "../models/User.model";
import { ShippingInfoDto } from "../dtos/stripe.dto";
import crypto from "crypto";
import { CartService } from "./cart.service";
import ProductModel, { IProduct } from "../models/Product.model";
import { ProductService } from "./product.service";
import {
  AuditAction,
  AuditSource,
  EntityType,
} from "@/app/lib/types/audit.types";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { v4 as uuidv4 } from "uuid";
import { setTimeout } from "timers/promises";
import OrderModel from "../models/Order.model ";
import {
  IOrderItem,
  OrderStatus,
  PaymentsMethod,
} from "@/app/lib/types/orders.types";
import { CartItemsType } from "@/app/lib/types/cart.types";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
import AuditLogModel from "../models/audit-log.model";
import { UserCurrency } from "@/app/lib/types/users.types";
import { Types } from "mongoose";
// stripe.service.ts

export interface FailedOrderData {
  sessionId: string;
  userId: string;
  error: string;
  metadata: any;
  products: Array<{ productId: string; quantity: number }>;
}
export const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

const RESERVATION_TIMEOUT = Number(process.env.RESERVATION_TIMEOUT || 15) * 60; // 15 minutes in seconds
const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
// Tax rate caching with TTL
const TAX_RATE_TTL = 3600; // 1 hour in seconds
const CACHE_PREFIX = "taxRate:";

export class StripeService {
  private userCartService = new CartService();
  private productService = new ProductService();

  async createStripeSession(
    user: IUser,
    shippingInfo: ShippingInfoDto
  ): Promise<{ sessionId: string; url: string }> {
    await this.validateEnvironment();
    const transaction = await mongoose.startSession();
    transaction.startTransaction();

    try {
      const BASE_URL = new URL(process.env.NEXTAUTH_URL!);
      const userCart = await this.userCartService.getMyCart(
        user._id.toString()
      );
      // 1. Get and validate cart FIRST
      if (userCart.length === 0) {
        throw new AppError("Cart is empty", 400);
      }
      // 2. Validate cart items first
      const { validProducts, invalidProducts } =
        await this.validateCartProducts(userCart);
      if (invalidProducts.length > 0) {
        // await this.handleInvalidCartItems(user._id.toString(), invalidProducts);
        throw new AppError(invalidProducts[0].message, 400);
      }

      // 3. Generate idempotency key based on validated products
      const idempotencyPayload = {
        validProducts: validProducts.map((p) => ({
          id: p.product._id.toString(),
          quantity: p.quantity,
        })),
        shippingInfo: this.normalizeShippingInfo(shippingInfo), // Normalized
        userId: user._id.toString(),
      };
      const idempotencyKey = crypto
        .createHash("sha256")
        .update(JSON.stringify(idempotencyPayload))
        .digest("hex");

      const cachedSession = await this.getCachedSession(idempotencyKey);
      if (cachedSession) return cachedSession;

      const reservationId = uuidv4();
      // 4. Reserve inventory using validated products
      await this.reserveInventoryWithRetry(
        validProducts.map((p) => ({
          _id: p.product._id,
          quantity: p.quantity,
        })),
        user,
        reservationId,
        transaction
      );
      console.log("Before Session created", idempotencyKey);

      const session = await this.createStripeCheckoutSession(
        user,
        validProducts,
        shippingInfo,
        BASE_URL,
        idempotencyKey
      );
      console.log("Session created", session);
      await this.cacheSession(idempotencyKey, session);
      await transaction.commitTransaction();
      return { sessionId: session.id, url: session.url! };
    } catch (error) {
      await transaction.abortTransaction();
      await this.handleCreateSessionError(error as Error, user);
      throw error;
    } finally {
      transaction.endSession();
    }
  }

  private async createStripeCheckoutSession(
    user: IUser,
    validProducts: Array<{ product: IProduct; quantity: number }>, // Now receives pre-validated products
    shippingInfo: ShippingInfoDto,
    BASE_URL: URL,
    idempotencyKey: string
  ) {
    // 1. Validate shipping info
    const normalizedShippingInfo = this.normalizeShippingInfo(shippingInfo);

    const textRate = await this.getTaxRate(shippingInfo.country);
    // 3. Create line items with verified prices
    const lineItems = await Promise.all(
      validProducts.map((product) =>
        this.createStripeLineItem(product, textRate)
      )
    );

    // 4. Proceed with session creation
    return stripe.checkout.sessions.create(
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
              line1: shippingInfo.street,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.postalCode,
              country: shippingInfo.country,
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
          shippingInfo: JSON.stringify(normalizedShippingInfo),
          idempotencyKey,
          reservationTimeout: Date.now() + RESERVATION_TIMEOUT * 1000,
        },
      },
      { idempotencyKey }
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const transaction = await mongoose.startSession();
    transaction.startTransaction();

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
            transaction
          );
          break;
        case "charge.refunded":
          await this.handleChargeRefunded(
            event.data.object as Stripe.Charge,
            transaction
          );
          break;
      }

      await transaction.commitTransaction();
    } catch (error) {
      await transaction.abortTransaction();
      throw error;
    } finally {
      transaction.endSession();
    }
  }
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    transaction: mongoose.ClientSession
  ): Promise<void> {
    // Validate session metadata
    if (!session.metadata?.shippingInfo || !session.metadata?.idempotencyKey) {
      throw new AppError("Invalid session metadata", 400);
    }

    // Retrieve user and shipping info
    const user = await UserModel.findById(session.client_reference_id).session(
      transaction
    );
    if (!user) throw new AppError("User not found", 404);

    // Parse shipping information
    const shippingInfo = this.parseShippingInfo(session.metadata.shippingInfo);

    // Retrieve Stripe invoice and line items
    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    // Create order items
    const orderItems = await Promise.all(
      lineItems.data.map(async (item) => {
        const productMetadata = (item?.price?.product as Stripe.Product)
          .metadata; // Assuming you stored _id in metadata

        const product = await ProductModel.findById(
          productMetadata._id
        ).session(transaction);

        if (!product)
          throw new AppError(`Product not found: ${productMetadata.name}`, 404);

        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          discount: product.discount || 0,
          quantity: item.quantity || 0,
          sku: product.sku,
          attributes: product.attributes || {},
          shippingInfo: {
            weight: product.shippingInfo.weight || 0,
            dimensions: product.shippingInfo.dimensions || {
              length: 0,
              width: 0,
              height: 0,
            },
          },
          finalPrice: this.calculateFinalPrice(product, item.quantity || 1),
        };
      })
    );

    // Create order document
    const order = await OrderModel.create(
      [
        {
          userId: user._id,
          items: orderItems,
          shippingAddress: shippingInfo,
          payment: {
            method: PaymentsMethod.Credit_card, // Map from Stripe payment method
            transactionId: session.payment_intent as string,
          },
          status: OrderStatus.Processing,
          invoiceId: invoice.id,
          invoiceLink: invoice.invoice_pdf || "",
          subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
          tax: session.total_details?.amount_tax
            ? session.total_details.amount_tax / 100
            : 0,
          total: session.amount_total ? session.amount_total / 100 : 0,
          currency: session.currency?.toUpperCase() || UserCurrency.UAH,
        },
      ],
      { session: transaction }
    );

    // Update inventory and clear cart
    await this.updateInventory(orderItems, user, transaction);
    // await this.cartService.clearCart(user._id.toString(), transaction);

    // Audit log
    await this.createAuditLog(
      user._id,
      AuditAction.ORDER_CREATED,
      EntityType.ORDER,
      order[0]._id.toString(),
      { stripeSessionId: session.id },
      transaction
    );
  }
  private async handleChargeRefunded(
    charge: Stripe.Charge,
    transaction: mongoose.ClientSession
  ): Promise<void> {
    const order = await OrderModel.findOne({
      "payment.transactionId": charge.payment_intent,
    });
    if (!order) return;

    order.status = charge.refunded
      ? OrderStatus.Refunded
      : OrderStatus.PartiallyRefunded;
    await order.save({ session: transaction });

    await this.createAuditLog(
      new Types.ObjectId(charge.metadata.userId),
      AuditAction.ORDER_UPDATED,
      EntityType.ORDER,
      order._id.toString(),
      {
        status: order.status,
        refundAmount: charge.amount_refunded / 100,
        currency: charge.currency,
      },
      transaction
    );
  }
  private async createAuditLog(
    actor: Types.ObjectId,
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    context: Record<string, any>,
    session: mongoose.ClientSession
  ): Promise<void> {
    await AuditLogModel.create(
      [
        {
          actor,
          action,
          entityType,
          entityId,
          changes: [],
          context,
          source: AuditSource.API,
          correlationId: `CORR-${Date.now()}`,
        },
      ],
      { session }
    );
  }

  private async updateInventory(
    orderItems: IOrderItem[],
    user: IUser,
    session: mongoose.ClientSession
  ): Promise<void> {
    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.productId },
        update: {
          $inc: { stock: -item.quantity, sold: item.quantity },
          $set: { modifiedAt: new Date(), lastModifiedBy: user._id },
        },
      },
    }));

    await ProductModel.bulkWrite(bulkOps, { session });
  }
  private async reserveInventoryWithRetry(
    userCart: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
    user: IUser,
    reservationId: string,
    session: mongoose.ClientSession,
    retries = 3
  ): Promise<void> {
    const lockKey = `inventory_lock:${reservationId}`;
    let locked = false;

    try {
      locked = await this.acquireLock(lockKey, 30);
      if (!locked) throw new AppError("Inventory reservation conflict", 409);

      await this.reserveInventory(userCart, user, session);
    } catch (error) {
      if (retries > 0 && error instanceof AppError) {
        const delay = 2 ** (4 - retries) * 100; // Exponential backoff
        await setTimeout(delay);
        return this.reserveInventoryWithRetry(
          userCart,
          user,
          reservationId,
          session,
          retries - 1
        );
      }
      throw error;
    } finally {
      if (locked) await this.releaseLock(lockKey);
    }
  }

  private async handleCreateSessionError(
    error: Error,
    user: IUser
  ): Promise<void> {
    await AuditLogModel.create([
      {
        actor: user._id.toString(),
        action: AuditAction.CHECKOUT_FAILURE,
        entityType: EntityType.ORDER,
        entityId: "N/A",
        changes: [],
        context: {
          error: error.message,
          userId: user._id.toString(),
          stack: error.stack,
        },
      },
    ]);
  }

  private async reserveInventory(
    products: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
    user: IUser,
    session: mongoose.ClientSession
  ): Promise<void> {
    const bulkOps = products.map(({ _id, quantity }) => ({
      updateOne: {
        filter: {
          _id,
          stock: { $gte: quantity },
          $expr: { $lt: ["$reserved", "$stock"] },
        },
        update: {
          $inc: { reserved: quantity },
          $set: {
            lastReserved: new Date(),
            lastModifiedBy: user._id,
            modifiedAt: new Date(),
          },
        },
      },
    }));

    const result = await ProductModel.bulkWrite(bulkOps, { session });

    if (result.modifiedCount !== products.length) {
      const successfulIds = Object.keys(result.modifiedCount);
      const failedProducts = products.filter(
        (p) => !successfulIds.includes(p._id.toString())
      );

      // await this.handlePartialReservationFailure(user, failedProducts);
      throw new AppError("Partial inventory reservation failed", 409);
    }
  }
  private parseShippingInfo(shippingInfo: string): ShippingInfoDto {
    try {
      return JSON.parse(shippingInfo);
    } catch (e) {
      throw new AppError("Invalid shipping information format", 400);
    }
  }
  private calculateFinalPrice(product: IProduct, quantity: number): number {
    const price =
      product.discountExpire && product.discountExpire > new Date()
        ? product.price - (product.discount || 0)
        : product.price;

    return Number((price * quantity).toFixed(2));
  } // Distributed locking functions
  private async acquireLock(
    key: string,
    ttl: number = RESERVATION_TIMEOUT
  ): Promise<boolean> {
    const result = await redis.set(key, "locked", { nx: true, ex: ttl });
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
    } catch (e) {
      throw new AppError("Invalid NEXTAUTH_URL format", 500);
    }
  }
  async getCachedSession(idempotencyKey: string) {
    const cachedSession = await redis.get<any>(idempotencyKey);
    if (cachedSession) {
      // Handle both string and object cases
      if (typeof cachedSession === "string") {
        return JSON.parse(cachedSession);
      }
      return cachedSession;
    }
    return null;
  }
  async cacheSession(idempotencyKey: string, session: Stripe.Checkout.Session) {
    await redis.set(
      idempotencyKey,
      JSON.stringify({ sessionId: session.id, url: session.url! }),
      { ex: RESERVATION_TIMEOUT }
    );
  }

  private async getTaxRate(country: string): Promise<string> {
    const countryCode = country.toUpperCase();
    const cacheKey = `${CACHE_PREFIX}${countryCode}`;

    // Check cache with lock to prevent race conditions
    const lockKey = `taxrate:${countryCode}:lock`;
    const locked = await this.acquireLock(lockKey, 5);

    try {
      if (locked) {
        const cachedId = await redis.get<string>(cacheKey);
        if (cachedId) return cachedId;

        const taxRate = await stripe.taxRates.create({
          display_name: "Sales Tax",
          description: `${feePercentage}% Tax`,
          jurisdiction: countryCode,
          percentage: feePercentage,
          inclusive: false,
        });
        await redis.setex(cacheKey, TAX_RATE_TTL, taxRate.id);
        return taxRate.id;
      } else {
        // Wait and retry if another process is creating the tax rate
        await setTimeout(100);
        return this.getTaxRate(country);
      }
    } finally {
      if (locked) await this.releaseLock(lockKey);
    }
  }
  private async validateCartProducts(cartItems: CartItemsType[]) {
    const productIds = cartItems.map((item) => assignAsObjectId(item._id));

    // 1. Bulk fetch with fresh data
    const products = await ProductModel.find({
      _id: { $in: productIds },
      active: true,
      stock: { $gte: 1 },
    }).lean();

    // 2. Create validation map
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. Validate each cart item
    const results = {
      validProducts: [] as Array<{ product: IProduct; quantity: number }>,
      invalidProducts: [] as Array<{
        name: string;
        _id: string;
        message: string;
      }>,
    };

    for (const item of cartItems) {
      const product = productMap.get(item._id.toString());

      if (!product || product.stock < item.quantity) {
        results.invalidProducts.push({
          name: item.name,
          _id: item._id,
          message: `Product ${item.name} found or insufficient stock`,
        });
        continue;
      }

      // 4. Price validation
      const currentPrice = this.calculateCurrentPrice(product);
      const currentItemPrice = this.calculateCurrentPrice(item);
      if (currentPrice !== currentItemPrice) {
        results.invalidProducts.push({
          name: item.name,
          _id: item._id,
          message: `Product ${item.name} price mismatch`,
        });
        continue;
      }

      results.validProducts.push({
        product: product as IProduct,
        quantity: item.quantity,
      });
    }

    return results;
  }

  private calculateCurrentPrice(
    product: Pick<IProduct, "price" | "discount" | "discountExpire">
  ) {
    return product.discountExpire && product.discountExpire > new Date()
      ? Number((product.price - product.discount).toFixed(2))
      : product.price;
  }

  private async createStripeLineItem(
    item: { product: IProduct; quantity: number },
    taxRate: string
  ) {
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
        unit_amount: Math.round(this.calculateCurrentPrice(item.product) * 100),
      },
      quantity: item.quantity,
      tax_rates: [taxRate],
    };
  }

  private async handleInvalidCartItems(
    userId: string,
    invalidProductIds: string[]
  ) {
    // 1. Remove invalid items from cart
    await this.userCartService.deleteManyByProductId(userId, invalidProductIds);

    // 2. Cache invalidation
    const cartKey = `cart:${userId}`;
    await redis.del(cartKey);

    // 3. Notify user
    // await NotificationService.sendCartUpdateNotification(
    //   userId,
    //   invalidProductIds
    // );
  }
  private normalizeShippingInfo(
    shippingInfo: ShippingInfoDto
  ): ShippingInfoDto {
    return {
      street: shippingInfo.street.trim(),
      city: shippingInfo.city.trim(),
      state: shippingInfo.state.trim(),
      postalCode: shippingInfo.postalCode.trim(),
      country: shippingInfo.country.trim(),
      phone: shippingInfo.phone.trim(),
    };
  }
}
