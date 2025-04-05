import crypto from 'crypto';
import {setTimeout} from 'timers/promises';

import {MongoBulkWriteError} from 'mongodb';
import mongoose from 'mongoose';
import {Types} from 'mongoose';
import Stripe from 'stripe';

import logger from '@/app/lib/logger/logs';
import {AuditAction, AuditSource, EntityType} from '@/app/lib/types/audit.types';
import type {CartItemsType} from '@/app/lib/types/cart.types';
import {type IOrderItem, OrderStatus, PaymentsMethod} from '@/app/lib/types/orders.types';
import {UserCurrency, UserRole, UserStatus} from '@/app/lib/types/users.types';
import AppError from '@/app/lib/utilities/appError';
import {assignAsObjectId} from '@/app/lib/utilities/assignAsObjectId';
import {lang} from '@/app/lib/utilities/lang';
import {redis} from '@/app/lib/utilities/Redis';
import {stripeControllerTranslate} from '@/public/locales/server/stripeControllerTranslate';

import type {LogsTypeDto} from '../dtos/logs.dto';
import type {ShippingInfoDto} from '../dtos/stripe.dto';
import AuditLogModel from '../models/audit-log.model';
import OrderModel from '../models/Order.model';
import ProductModel, {type IProduct} from '../models/Product.model';
import UserModel, {type IUser} from '../models/User.model';

import {CartService} from './cart.service';
import type {AdminInventoryNotification} from './email.service';
import {ProductService} from './product.service';

import {emailService} from '.';

// stripe.service.ts

export interface FailedOrderData {
  sessionId: string;
  userId: string;
  error: string;
  metadata: any;
  products: Array<{productId: string; quantity: number}>;
}
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
  constructor(
    private readonly userCartService: CartService = new CartService(),
    private readonly productService: ProductService = new ProductService(),
  ) {
    this.RESERVATION_TIMEOUT = Number(process.env.RESERVATION_TIMEOUT || 15) * 60; // 15 minutes in seconds
    this.feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
    this.TAX_RATE_TTL = 3600; // 1 hour in seconds
    this.CACHE_PREFIX = 'taxRate:';
  }
  async createStripeSession(
    user: IUser,
    shippingInfo: ShippingInfoDto,
    logs: LogsTypeDto,
  ): Promise<{sessionId: string; url: string}> {
    await this.validateEnvironment();
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      const transaction = await mongoose.startSession();
      transaction.startTransaction();
      try {
        const BASE_URL = new URL(process.env.NEXTAUTH_URL!);
        const userCart = await this.userCartService.getMyCart(user._id.toString());
        // 1. Get and validate cart FIRST
        if (userCart.length === 0) {
          throw new AppError(stripeControllerTranslate[lang].errors.cartEmpty, 400);
        }
        // 2. Validate cart items first
        const {validProducts, invalidProducts} = await this.validateCartProducts(userCart);
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
          .createHash('sha256')
          .update(JSON.stringify(idempotencyPayload))
          .digest('hex');

        const cachedSession = await this.getCachedSession(idempotencyKey);
        if (cachedSession) return cachedSession;

        // const reservationId = uuidv4();
        // 4. Reserve inventory using validated products
        await this.reserveInventoryWithRetry(
          validProducts.map((p) => ({
            _id: p.product._id,
            quantity: p.quantity,
            name: p.product.name,
          })),
          user,
          logs,
          // reservationId,
          transaction,
        );

        const session = await this.createStripeCheckoutSession(
          user,
          validProducts,
          shippingInfo,
          BASE_URL,
          idempotencyKey,
        );
        await this.cacheSession(idempotencyKey, session);

        await transaction.commitTransaction();
        return {sessionId: session.id, url: session.url!};
      } catch (error) {
        await transaction.abortTransaction();

        if (this.isTransientError(error)) {
          retryCount++;
          await setTimeout(50 * retryCount);
          continue;
        }

        await this.handleCreateSessionError(error as Error, user);
        throw error;
      } finally {
        await transaction.endSession();
      }
    }
    throw new AppError(
      stripeControllerTranslate[lang].errors.maxRetry,

      500,
    );
  }

  // async createStripeSessionOld(
  //   user: IUser,
  //   shippingInfo: ShippingInfoDto
  // ): Promise<{ sessionId: string; url: string }> {
  //   await this.validateEnvironment();
  //   const transaction = await mongoose.startSession();
  //   transaction.startTransaction();

  //   try {
  //     const BASE_URL = new URL(process.env.NEXTAUTH_URL!);
  //     const userCart = await this.userCartService.getMyCart(
  //       user._id.toString()
  //     );
  //     // 1. Get and validate cart FIRST
  //     if (userCart.length === 0) {
  //       throw new AppError("Cart is empty", 400);
  //     }
  //     // 2. Validate cart items first
  //     const { validProducts, invalidProducts } =
  //       await this.validateCartProducts(userCart);
  //     if (invalidProducts.length > 0) {
  //       // await this.handleInvalidCartItems(user._id.toString(), invalidProducts);
  //       throw new AppError(invalidProducts[0].message, 400);
  //     }

  //     // 3. Generate idempotency key based on validated products
  //     const idempotencyPayload = {
  //       validProducts: validProducts.map((p) => ({
  //         id: p.product._id.toString(),
  //         quantity: p.quantity,
  //       })),
  //       shippingInfo: this.normalizeShippingInfo(shippingInfo), // Normalized
  //       userId: user._id.toString(),
  //     };
  //     const idempotencyKey = crypto
  //       .createHash("sha256")
  //       .update(JSON.stringify(idempotencyPayload))
  //       .digest("hex");

  //     const cachedSession = await this.getCachedSession(idempotencyKey);
  //     if (cachedSession) return cachedSession;

  //     const reservationId = uuidv4();
  //     // 4. Reserve inventory using validated products
  //     await this.reserveInventoryWithRetry(
  //       validProducts.map((p) => ({
  //         _id: p.product._id,
  //         quantity: p.quantity,
  //       })),
  //       user,
  //       reservationId,
  //       transaction
  //     );

  //     const session = await this.createStripeCheckoutSession(
  //       user,
  //       validProducts,
  //       shippingInfo,
  //       BASE_URL,
  //       idempotencyKey
  //     );
  //     await this.cacheSession(idempotencyKey, session);
  //     await transaction.commitTransaction();
  //     return { sessionId: session.id, url: session.url! };
  //   } catch (error) {
  //     await transaction.abortTransaction();
  //     await this.handleCreateSessionError(error as Error, user);
  //     throw error;
  //   } finally {
  //     transaction.endSession();
  //   }
  // }

  private async createStripeCheckoutSession(
    user: IUser,
    validProducts: Array<{product: IProduct; quantity: number}>, // Now receives pre-validated products
    shippingInfo: ShippingInfoDto,
    BASE_URL: URL,
    idempotencyKey: string,
  ) {
    // 1. Validate shipping info
    const normalizedShippingInfo = this.normalizeShippingInfo(shippingInfo);

    const textRate = await this.getTaxRate(shippingInfo.country);
    // 3. Create line items with verified prices
    const lineItems = await Promise.all(
      validProducts.map((product) => this.createStripeLineItem(product, textRate)),
    );

    // 4. Proceed with session creation
    return await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: user.email,
        client_reference_id: user._id.toString(),
        line_items: lineItems,
        success_url: new URL('/account/orders/success', BASE_URL).toString(),
        cancel_url: new URL('/account/orders/cancel', BASE_URL).toString(),
        payment_intent_data: {
          receipt_email: user?.email,
          shipping: {
            name: user?.name ?? 'Unknown',
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
                name: stripeControllerTranslate[lang].functions.invoiceDetails.custom_fields.name,
                value: stripeControllerTranslate[lang].functions.invoiceDetails.custom_fields.value,
              },
            ],
            description: stripeControllerTranslate[lang].functions.invoiceDetails.description,
            footer:
              stripeControllerTranslate[lang].functions.invoiceDetails.footer +
              process.env.COMPANY_MAIL,
            // You can add other fields as needed
          },
        },

        metadata: {
          shippingInfo: JSON.stringify(normalizedShippingInfo),
          idempotencyKey,
          reservationTimeout: Date.now() + this.RESERVATION_TIMEOUT * 1000,
        },
      },
      // { idempotencyKey }
    );
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const transaction = await mongoose.startSession();
    transaction.startTransaction();

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session,
            transaction,
          );
          break;
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge, transaction);
          break;
      }

      await transaction.commitTransaction();
    } catch (error) {
      await transaction.abortTransaction();
      throw error;
    } finally {
      await transaction.endSession();
    }
  }
  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    transaction: mongoose.ClientSession,
  ): Promise<void> {
    const lockKey = `order:${session.id}`;
    const locked = await this.acquireLock(lockKey);
    if (!locked)
      throw new AppError(
        stripeControllerTranslate[lang].errors.ConcurrentOrder,

        409,
      );

    // Validate session metadata
    if (!session.metadata?.shippingInfo || !session.metadata?.idempotencyKey) {
      throw new AppError(stripeControllerTranslate[lang].errors.InvalidMetadata, 400);
    }

    // Retrieve user and shipping info
    const user = await UserModel.findById(session.client_reference_id).session(transaction);
    if (!user) throw new AppError(stripeControllerTranslate[lang].errors.noUserExist, 404);
    try {
      // Parse shipping information
      const shippingInfo = this.parseShippingInfo(session.metadata.shippingInfo);
      // Retrieve Stripe invoice and line items
      const [lineItems, invoice] = await Promise.all([
        stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product'],
        }),
        stripe.invoices.retrieve(session.invoice as string),
      ]);

      // Create order items
      const orderItems = await this.processOrderItems(lineItems.data, transaction);

      // Create order document
      await this.createOrderFromSession(
        session,
        user,
        shippingInfo,
        transaction,
        orderItems,
        invoice,
      );
      // Update inventory and clear cart
      await this.updateInventory(orderItems, user, transaction);
      // await this.cartService.clearCart(user._id.toString(), transaction);

      // Send order confirmation
      // await this.sendOrderConfirmation(user, order, transaction);
      await emailService.sendEmailWithInvoice(
        user.email,

        invoice.invoice_pdf!,
        invoice.id!,
        new Date(invoice.created * 1000).toLocaleDateString(),
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
    transaction: mongoose.ClientSession,
  ): Promise<void> {
    const order = await OrderModel.findOne({
      'payment.transactionId': charge.payment_intent,
    });
    if (!order) return;

    order.status = charge.refunded ? OrderStatus.Refunded : OrderStatus.PartiallyRefunded;
    await order.save({session: transaction});

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
      transaction,
    );
  }
  private async createAuditLog(
    actor: Types.ObjectId,
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    context: Record<string, any>,
    session?: mongoose.ClientSession,
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
      {session},
    );
  }

  private async updateInventory(
    orderItems: IOrderItem[],
    user: IUser,
    session: mongoose.ClientSession,
  ): Promise<void> {
    const bulkOps = orderItems.map((item) => ({
      updateOne: {
        filter: {_id: item.productId},
        update: {
          $inc: {
            stock: -item.quantity,
            sold: item.quantity,
            reserved: -item.quantity,
          },
          $set: {modifiedAt: new Date(), lastModifiedBy: user._id},
        },
      },
    }));

    await ProductModel.bulkWrite(bulkOps, {session});
  }
  private async processOrderItems(items: Stripe.LineItem[], session: mongoose.ClientSession) {
    return await Promise.all(
      items.map(async (item) => {
        const productMetadata = (item?.price?.product as Stripe.Product).metadata; // Assuming you stored _id in metadata

        const product = await ProductModel.findById(productMetadata._id).session(session);

        if (!product)
          throw new AppError(
            stripeControllerTranslate[lang].errors.notFoundProduct(productMetadata.name),
            404,
          );
        // throw new AppError(`Product not found: ${productMetadata.name}`, 404);

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
      }),
    );
  }
  private async createOrderFromSession(
    session: Stripe.Checkout.Session,
    user: IUser,
    shippingInfo: ShippingInfoDto,
    transaction: mongoose.ClientSession,
    orderItems: IOrderItem[],
    invoice: Stripe.Invoice,
  ) {
    try {
      await OrderModel.create(
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
            invoiceLink: invoice.invoice_pdf || '',
            subtotal: session.amount_subtotal ? session.amount_subtotal / 100 : 0,
            tax: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
            total: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency?.toUpperCase() || UserCurrency.UAH,
          },
        ],
        {session: transaction},
      );
    } catch (error) {
      await this.handleOrderFailure(user, error as Error);

      throw error;
    }
  }
  private async handleOrderFailure(user: IUser, error: Error) {
    await this.createAuditLog(
      user._id,
      AuditAction.ORDER_FAILURE,
      EntityType.ORDER,
      'N/A',

      {
        error: error.message,
        stack: error.stack,
      },
    );
  }
  // private async reserveInventoryWithRetry3(
  //   products: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
  //   user: IUser,
  //   session: mongoose.ClientSession
  // ) {
  //   const sortedProducts = [...products].sort((a, b) =>
  //     a._id.toString().localeCompare(b._id.toString())
  //   );

  //   const lockPromises = sortedProducts.map(async (product) => {
  //     const lockKey = `product_lock:${product._id}`;
  //     let acquired = false;
  //     let attempts = 0;

  //     while (!acquired && attempts < 5) {
  //       acquired = await this.acquireLock(lockKey, 60); // 60 second TTL
  //       if (!acquired) {
  //         attempts++;
  //         await setTimeout(200 * attempts); // Linear backoff
  //       }
  //     }

  //     if (!acquired) throw new AppError(`Lock failed for ${product._id}`, 409);
  //     return lockKey;
  //   });

  //   const lockKeys = await Promise.all(lockPromises);

  //   try {
  //     await this.reserveInventory(sortedProducts, user, session);
  //   } finally {
  //     await Promise.all(lockKeys.map((key) => this.releaseLock(key)));
  //   }
  // }
  private async reserveInventoryWithRetry(
    products: Array<{
      _id: mongoose.Types.ObjectId;
      quantity: number;
      name: string;
    }>,
    user: IUser,
    logs: LogsTypeDto,
    session: mongoose.ClientSession,
    maxRetries = 5,
  ): Promise<void> {
    // Sort products by ID to prevent deadlocks
    const sortedProducts = [...products].sort((a, b) =>
      a._id.toString().localeCompare(b._id.toString()),
    );

    const lockKeys = sortedProducts.map((p) => `product_lock:${p._id.toString()}`);
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
          const delay = Math.min(100 * Math.pow(2, attempts), 6000);
          await setTimeout(delay);

          if (attempts === maxRetries) {
            throw new AppError(
              stripeControllerTranslate[lang].errors.acquireLock(
                sortedProducts[index]._id.toString(),
                maxRetries,
              ),
              409,
            );
          }
        }
      }

      // Proceed with inventory reservation after acquiring all locks
      await this.reserveInventory(sortedProducts, user, logs, session);
    } finally {
      // Release all locks in reverse order
      for (const lockKey of [...acquiredLocks].reverse()) {
        await this.releaseLock(lockKey).catch((error) => {
          logger.error(`Failed to release lock: ${lockKey}`, error);
        });
      }
    }
  }
  // private async reserveInventoryWithRetryOld2(
  //   products: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
  //   user: IUser,
  //   // reservationId: string,
  //   session: mongoose.ClientSession,
  //   retries = 3
  // ): Promise<void> {
  //   // Sort products by ID to acquire locks in consistent order
  //   const sortedProducts = [...products].sort((a, b) =>
  //     a._id.toString().localeCompare(b._id.toString())
  //   );

  //   const lockKeys = sortedProducts.map((p) => `product_lock:${p._id}`);

  //   try {
  //     // Acquire all locks in order
  //     for (const lockKey of lockKeys) {
  //       let acquired = false;
  //       while (!acquired && retries > 0) {
  //         acquired = await this.acquireLock(lockKey, 30);
  //         if (!acquired) {
  //           retries--;
  //           await setTimeout(100);
  //         }
  //       }
  //       if (!acquired) throw new AppError("Failed to acquire locks", 409);
  //     }

  //     await this.reserveInventory(sortedProducts, user, session);
  //   } finally {
  //     // Release all locks in reverse order
  //     for (const lockKey of lockKeys.reverse()) {
  //       await this.releaseLock(lockKey);
  //     }
  //   }
  // }
  // private async reserveInventoryWithRetryOld(
  //   userCart: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
  //   user: IUser,
  //   reservationId: string,
  //   session: mongoose.ClientSession,
  //   retries = 3
  // ): Promise<void> {
  //   const lockKey = `inventory_lock:${reservationId}`;
  //   let locked = false;

  //   try {
  //     locked = await this.acquireLock(lockKey, 30);
  //     if (!locked) throw new AppError("Inventory reservation conflict", 409);

  //     await this.reserveInventory(userCart, user, session);
  //   } catch (error) {
  //     if (retries > 0 && error instanceof AppError) {
  //       const delay = 2 ** (4 - retries) * 100; // Exponential backoff
  //       await setTimeout(delay);
  //       return this.reserveInventoryWithRetry(
  //         userCart,
  //         user,
  //         reservationId,
  //         session,
  //         retries - 1
  //       );
  //     }
  //     throw error;
  //   } finally {
  //     if (locked) await this.releaseLock(lockKey);
  //   }
  // }

  private async handleCreateSessionError(error: Error, user: IUser): Promise<void> {
    await AuditLogModel.create([
      {
        actor: user._id.toString(),
        action: AuditAction.CHECKOUT_FAILURE,
        entityType: EntityType.ORDER,
        entityId: 'N/A',
        changes: [],
        context: {
          error: error.message,
          userId: user._id.toString(),
          stack: error.stack,
        },
      },
    ]);
  }
  // private async reserveInventory(
  //   products: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
  //   user: IUser,
  //   logs: LogsTypeDto,
  //   session: mongoose.ClientSession
  // ): Promise<void> {
  //   // Aggregate quantities for duplicate products
  //   const productMap = new Map<string, number>();

  //   products.forEach(({ _id, quantity }) => {
  //     const productId = _id.toString();
  //     productMap.set(productId, (productMap.get(productId) || 0) + quantity);
  //   });

  //   // Create consolidated bulk operations
  //   const bulkOps = Array.from(productMap.entries()).map(([_id, quantity]) => ({
  //     updateOne: {
  //       filter: {
  //         _id: new mongoose.Types.ObjectId(_id),
  //         $expr: {
  //           $gte: [{ $subtract: ["$stock", "$reserved"] }, quantity],
  //         },
  //       },
  //       update: {
  //         $inc: { reserved: quantity },
  //         $set: {
  //           lastModifiedBy: user._id,
  //           modifiedAt: new Date(),
  //         },
  //       },
  //     },
  //   }));

  //   try {
  //     const result = await ProductModel.bulkWrite(bulkOps, {
  //       session,
  //       ordered: true, // Process in sequence
  //       writeConcern: { w: "majority" },
  //     });

  //     // Handle partial failures for ordered operations
  //     if (result.modifiedCount !== bulkOps.length) {
  //       const successfulIds = new Set(
  //         Object.values(result.upsertedIds).map((id) => id.toString()) || []
  //       );

  //       const failedProducts = bulkOps
  //         .filter(
  //           (op) => !successfulIds.has(op.updateOne.filter._id.toString())
  //         )
  //         .map((op) => ({
  //           _id: op.updateOne.filter._id,
  //           quantity: productMap.get(op.updateOne.filter._id.toString())!,
  //         }));

  //       if (failedProducts.length > 0) {
  //         await this.handlePartialReservationFailure(
  //           user,
  //           failedProducts,
  //           logs
  //         );
  //         throw new AppError(
  //           `Partial reservation failed for ${failedProducts.length} products`,
  //           409
  //         );
  //       }
  //     }
  //   } catch (error) {
  //     if (error instanceof MongoBulkWriteError) {
  //       const failedIds = (
  //         Array.isArray(error.writeErrors)
  //           ? error.writeErrors
  //           : [error.writeErrors]
  //       ).map((e) => e.op.updateOne.filter._id.toString());
  //       const failedProducts = failedIds.map((id) => ({
  //         _id: assignAsObjectId(id),
  //         quantity: productMap.get(id)!,
  //       }));

  //       await this.handlePartialReservationFailure(user, failedProducts, logs);
  //     }
  //     throw error;
  //   }
  // }
  // 1. Modify the productMap to track names
  private async reserveInventory(
    products: Array<{
      _id: mongoose.Types.ObjectId;
      quantity: number;
      name: string;
    }>,
    user: IUser,
    logs: LogsTypeDto,
    session: mongoose.ClientSession,
  ): Promise<void> {
    // Track both quantity and product name
    const productMap = new Map<string, {totalQuantity: number; name: string}>();

    products.forEach(({_id, quantity, name}) => {
      const productId = _id.toString();
      const existing = productMap.get(productId);

      if (existing) {
        existing.totalQuantity += quantity;
      } else {
        productMap.set(productId, {totalQuantity: quantity, name});
      }
    });

    // Create bulk operations with aggregated quantities
    const bulkOps = Array.from(productMap.entries()).map(([productId, {totalQuantity}]) => ({
      updateOne: {
        filter: {
          _id: new mongoose.Types.ObjectId(productId),
          $expr: {
            $gte: [{$subtract: ['$stock', '$reserved']}, totalQuantity],
          },
        },
        update: {
          $inc: {reserved: totalQuantity},
          $set: {
            lastModifiedBy: user._id,
            modifiedAt: new Date(),
          },
        },
      },
    }));

    try {
      const result = await ProductModel.bulkWrite(bulkOps, {
        session,
        ordered: true, // Process in sequence
        writeConcern: {w: 'majority'},
      });

      // Handle partial failures for ordered operations
      if (result.modifiedCount !== bulkOps.length) {
        const successfulIds = new Set(
          Object.values(result.upsertedIds).map((id) => id.toString()) || [],
        );

        const failedProducts = bulkOps
          .filter((op) => !successfulIds.has(op.updateOne.filter._id.toString()))
          .map((op) => {
            const productId = op.updateOne.filter._id.toString();
            return {
              _id: op.updateOne.filter._id,
              quantity: productMap.get(productId)!.totalQuantity,
              name: productMap.get(productId)!.name,
            };
          });

        if (failedProducts.length > 0) {
          await this.handlePartialReservationFailure(user, failedProducts, logs);
          throw new AppError(
            stripeControllerTranslate[lang].errors.PartialReservation(failedProducts.length),
            409,
          );
        }
      }
    } catch (error) {
      if (error instanceof MongoBulkWriteError) {
        const failedIds = (
          Array.isArray(error.writeErrors) ? error.writeErrors : [error.writeErrors]
        ).map((e) => e.op.updateOne.filter._id.toString());
        const failedProducts = failedIds.map((id) => ({
          _id: assignAsObjectId(id),
          quantity: productMap.get(id)!.totalQuantity,
          name: productMap.get(id)!.name,
        }));

        await this.handlePartialReservationFailure(user, failedProducts, logs);
      }
      throw error;
    }
  }
  private async handlePartialReservationFailure(
    user: IUser,
    failedProducts: Array<{
      _id: mongoose.Types.ObjectId;
      quantity: number;
      name: string;
    }>,
    logs: LogsTypeDto,
  ): Promise<void> {
    // 1. Log audit entry

    await this.productService.logAction(
      AuditAction.INVENTORY_RESERVATION_PARTIAL,
      'BATCH_UPDATE',
      user._id,
      failedProducts.map((p) => ({
        field: 'reserved',
        productId: p._id,
        quantity: p.quantity,
        productName: p.name,
        changeType: 'MODIFY',
      })),
      logs.ipAddress,
      logs.userAgent,
    );

    // 2. Notify admins
    // Get admins with proper typing and security
    const admins = await UserModel.find({
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    })
      .select('email')
      .lean();

    const notification: AdminInventoryNotification = {
      type: 'INVENTORY_RESERVATION_PARTIAL',
      userId: user._id.toString(),
      failedProducts: failedProducts.map((p) => ({
        productId: p._id.toString(),
        productName: p.name, // Add product name from your Product model
        quantity: p.quantity,
      })),
      timestamp: new Date(),
    };

    await emailService.sendAdminNotification(admins, notification);
  }
  private parseShippingInfo(shippingInfo: string): ShippingInfoDto {
    try {
      return JSON.parse(shippingInfo);
    } catch (_e) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.InvalidShipping,

        400,
      );
    }
  }
  private calculateFinalPrice(product: IProduct, quantity: number): number {
    const price =
      product.discountExpire && product.discountExpire > new Date()
        ? product.price - (product.discount || 0)
        : product.price;

    return Number((price * quantity).toFixed(2));
  } // Distributed locking functions
  private async acquireLock(key: string, ttl: number = this.RESERVATION_TIMEOUT): Promise<boolean> {
    const result = await redis.set(key, 'locked', {
      nx: true, // Only set if not exists
      ex: ttl, // Set expiration
    });
    return result === 'OK';
  }

  private async releaseLock(key: string) {
    await redis.del(key);
  }
  private async validateEnvironment() {
    if (!process.env.NEXTAUTH_URL) {
      throw new AppError('NEXTAUTH_URL environment variable is required', 500);
    }
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch (_e) {
      throw new AppError('Invalid NEXTAUTH_URL format', 500);
    }
  }
  async getCachedSession(idempotencyKey: string) {
    const cachedSession = await redis.get<any>(idempotencyKey);
    if (cachedSession) {
      // Handle both string and object cases
      if (typeof cachedSession === 'string') {
        return JSON.parse(cachedSession);
      }
      return cachedSession;
    }
    return null;
  }
  async cacheSession(idempotencyKey: string, session: Stripe.Checkout.Session) {
    await redis.set(idempotencyKey, JSON.stringify({sessionId: session.id, url: session.url!}), {
      ex: this.RESERVATION_TIMEOUT,
    });
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
        if (cachedId) return cachedId;

        const taxRate = await stripe.taxRates.create({
          display_name: 'Sales Tax',
          description: `${this.feePercentage}% Tax`,
          jurisdiction: countryCode,
          percentage: this.feePercentage,
          inclusive: false,
        });
        await redis.setex(cacheKey, this.TAX_RATE_TTL, taxRate.id);
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
      _id: {$in: productIds},
      active: true,
      stock: {$gte: 1},
    }).lean();

    // 2. Create validation map
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // 3. Validate each cart item
    const results = {
      validProducts: [] as Array<{product: IProduct; quantity: number}>,
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
            availableStock,
          ),
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
          message: stripeControllerTranslate[lang].errors.priceMismatch(item.name),
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

  private calculateCurrentPrice(product: Pick<IProduct, 'price' | 'discount' | 'discountExpire'>) {
    return product.discountExpire && product.discountExpire > new Date()
      ? Number((product.price - product.discount).toFixed(2))
      : product.price;
  }

  private async createStripeLineItem(item: {product: IProduct; quantity: number}, taxRate: string) {
    return {
      price_data: {
        currency: 'usd',
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

  // private async _handleInvalidCartItems(
  //   userId: string,
  //   invalidProductIds: string[]
  // ) {
  //   // 1. Remove invalid items from cart
  //   await this.userCartService.deleteManyByProductId(userId, invalidProductIds);

  //   // 2. Cache invalidation
  //   const cartKey = `cart:${userId}`;
  //   await redis.del(cartKey);

  //   // 3. Notify user
  //   // await NotificationService.sendCartUpdateNotification(
  //   //   userId,
  //   //   invalidProductIds
  //   // );
  // }
  private normalizeShippingInfo(shippingInfo: ShippingInfoDto): ShippingInfoDto {
    // ): Omit<ShippingInfoDto, "phone"> {
    return {
      street: shippingInfo.street.trim(),
      city: shippingInfo.city.trim(),
      state: shippingInfo.state.trim(),
      postalCode: shippingInfo.postalCode.trim(),
      country: shippingInfo.country.trim(),
      phone: shippingInfo.phone.trim(),
    };
  } // Type guard for transient errors
  private isTransientError(error: any): boolean {
    return (
      error?.errorLabels?.includes('TransientTransactionError') ||
      error?.codeName === 'WriteConflict'
    );
  }
}
