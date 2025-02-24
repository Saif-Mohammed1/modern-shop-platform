import Stripe from "stripe";
import mongoose from "mongoose";
import { sendEmailWithInvoice } from "@/app/lib/utilities/email";
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import { stripeControllerTranslate } from "../../../public/locales/server/stripeControllerTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { z } from "zod";
import crypto from "crypto";
import Order from "../models/Order.model ";
import User from "../models/User.model";
import Product from "../models/Product.model";
import { OrderStatus } from "@/app/lib/types/orders.types";
import AppError from "@/app/lib/utilities/appError";
import { redis } from "@/app/lib/utilities/Redis";

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

const RESERVATION_TIMEOUT = Number(process.env.RESERVATION_TIMEOUT || 15) * 60; // 15 minutes in seconds
const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);

// Zod schemas
const ShippingInfoSchema = z
  .object({
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(3),
    country: z.string().min(2),
    phone: z.string().min(6),
  })
  .superRefine((data, ctx) => {
    const hasError = Object.values(data).some(
      (value) => !value || String(value).trim().length === 0
    );
    if (hasError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          stripeControllerTranslate[lang].functions.createStripeProduct
            .shippingInfo.noShippingInfo,

        path: [],
      });
    }
  });

const ProductItemSchema = z
  .object({
    _id: z.string().min(1),
    quantity: z.number().int().positive(),
    name: z.string().min(1),
    price: z.number().positive(),
    images: z.array(z.object({ link: z.string().url() })).optional(),
  })
  .superRefine((data, ctx) => {
    const hasError = Object.values(data).some(
      (value) => !value || String(value).trim().length === 0
    );
    if (hasError) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          stripeControllerTranslate[lang].functions.createStripeProduct.products
            .noProducts,

        path: [],
      });
    }
  });

// Distributed locking functions
const acquireLock = async (key: string, ttl: number = RESERVATION_TIMEOUT) => {
  return await redis.set(key, "locked", { nx: true, ex: ttl });
};

const releaseLock = async (key: string) => {
  await redis.del(key);
};

// Inventory management functions
const reserveInventory = async (
  products: Array<{ _id: string; quantity: number }>,
  session: mongoose.ClientSession
) => {
  const bulkOps = products.map(({ _id, quantity }) => ({
    updateOne: {
      filter: {
        _id: new mongoose.Types.ObjectId(_id),
        stock: { $gte: quantity },
        $expr: { $lt: ["$reserved", "$stock"] },
      },
      update: {
        $inc: { reserved: quantity },
        $set: { lastReserved: new Date() },
      },
    },
  }));

  const result = await Product.bulkWrite(bulkOps, { session });
  if (result.modifiedCount !== products.length) {
    throw new AppError("Inventory reservation failed", 409);
  }
};

const releaseInventory = async (
  products: Array<{ _id: string; quantity: number }>,
  session: mongoose.ClientSession
) => {
  await Product.bulkWrite(
    products.map(({ _id, quantity }) => ({
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(_id) },
        update: { $inc: { reserved: -quantity } },
      },
    })),
    { session }
  );
};

export const createStripeProduct = async (req: NextRequest) => {
  const transaction = await mongoose.startSession();
  transaction.startTransaction();

  try {
    // Validate input
    const { products, shippingInfo } = await req.json();
    const validatedShippingInfo = ShippingInfoSchema.parse(shippingInfo);
    const validatedProducts = z.array(ProductItemSchema).parse(products);

    if (!req.user?.email) throw new AppError("Authentication required", 401);

    // Reserve inventory
    await reserveInventory(
      validatedProducts.map((p) => ({ _id: p._id, quantity: p.quantity })),
      transaction
    );

    // Generate idempotency key
    const idempotencyKey = crypto
      .createHash("sha256")
      .update(JSON.stringify({ products, shippingInfo, user: req.user._id }))
      .digest("hex");

    // Check for cached session
    // Check for cached session with proper type handling
    const cachedSession = await redis.get<string>(idempotencyKey);
    if (cachedSession) {
      return JSON.parse(cachedSession);
    }

    // Create Stripe session
    const lineItems = await Promise.all(
      validatedProducts.map(async (item) => {
        const product = await Product.findById(item._id).session(transaction);
        if (!product) throw new AppError(`Product ${item.name} not found`, 404);

        const price =
          product.discountExpire && product.discountExpire > new Date()
            ? product.price - (product.discount || 0)
            : product.price;

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              images: product.images.slice(0, 1).map((img) => img.link),
              metadata: { _id: product._id.toString() },
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: item.quantity,
          tax_rates: [await getTaxRate(validatedShippingInfo.country)],
        };
      })
    );

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        mode: "payment",
        customer_email: req.user.email,
        client_reference_id: req.user._id.toString(),
        line_items: lineItems,
        success_url: `${req.headers.get("origin")}/account/orders/success`,
        cancel_url: `${req.headers.get("origin")}/account/orders/cancel`,
        payment_intent_data: {
          receipt_email: req.user?.email,
          shipping: {
            name: req.user?.name ?? "Unknown",
            address: {
              line1: validatedShippingInfo.street,
              city: validatedShippingInfo.city,
              state: validatedShippingInfo.state,
              postal_code: validatedShippingInfo.postalCode,
              country: validatedShippingInfo.country,
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
          shippingInfo: JSON.stringify(validatedShippingInfo),
          idempotencyKey,
          reservationTimeout: Date.now() + RESERVATION_TIMEOUT * 1000,
        },
      },
      { idempotencyKey }
    );

    // Cache session and commit transaction
    await redis.set(
      idempotencyKey,
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        statusCode: 200,
      }),
      { ex: RESERVATION_TIMEOUT }
    );

    await transaction.commitTransaction();
    return {
      sessionId: session.id,
      url: session.url,
      statusCode: 200,
    };
  } catch (error) {
    await transaction.abortTransaction();
    if (error instanceof z.ZodError) {
      throw new AppError(error.errors.map((e) => e.message).join(", "), 400);
    }
    throw error;
  } finally {
    await transaction.endSession();
  }
};

export const handleStripeWebhook = async (req: NextRequest) => {
  const signature = headers().get("stripe-signature");
  if (!signature) throw new AppError("Missing signature", 400);

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const lockKey = `order:${session.id}`;

      if (!(await acquireLock(lockKey))) {
        throw new AppError("Concurrent order processing detected", 409);
      }

      try {
        const existingOrder = await Order.findOne({
          invoiceId: session.invoice,
        });
        if (existingOrder) return { received: true, statusCode: 200 };

        return await captureSuccessPayment(session);
      } finally {
        await releaseLock(lockKey);
      }
    }

    return { received: true, statusCode: 200 };
  } catch (err) {
    throw new AppError(
      stripeControllerTranslate[lang].functions.handleStripeWebhook.error,
      400
    );
  }
};

const captureSuccessPayment = async (session: Stripe.Checkout.Session) => {
  const transaction = await mongoose.startSession();
  transaction.startTransaction();

  try {
    if (session.payment_status !== "paid") {
      throw new AppError("Payment not completed", 400);
    }

    const user = await User.findById(session.client_reference_id).session(
      transaction
    );
    if (!user)
      throw new AppError(
        stripeControllerTranslate[lang].errors.noUserFound,
        404
      );

    // Finalize inventory
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    const inventoryUpdates = lineItems.data.map((item) => ({
      _id: (item.price?.product as Stripe.Product).metadata._id,
      quantity: item.quantity || 1,
    }));

    await Product.bulkWrite(
      inventoryUpdates.map(({ _id, quantity }) => ({
        updateOne: {
          filter: { _id },
          update: {
            $inc: {
              stock: -quantity,
              reserved: -quantity,
              sold: quantity,
            },
          },
        },
      })),
      { session: transaction }
    );

    // Create order
    const invoice = await stripe.invoices.retrieve(session.invoice as string);
    const shippingInfo = JSON.parse(session.metadata?.shippingInfo || "{}");

    const order = await Order.create(
      [
        {
          user: user._id,
          invoiceId: invoice.number,
          invoiceLink: invoice.hosted_invoice_url,
          totalPrice: (session.amount_total || 0) / 100,
          items: await Promise.all(
            inventoryUpdates.map(async (item) => {
              // Fetch full product details from database
              const product = await Product.findById(item._id)
                .select("name price discount discountExpire")
                .lean();

              if (!product) {
                throw new AppError(`Product ${item._id} not found`, 404);
              }

              // Verify stock again to prevent race conditions
              if (product.stock < item.quantity) {
                throw new AppError(
                  `Insufficient stock for ${product.name}`,
                  400
                );
              }

              // Calculate final price
              const isDiscountValid =
                product.discountExpire && product.discountExpire > new Date();
              const finalPrice = isDiscountValid
                ? product.price - (product.discount || 0)
                : product.price;

              return {
                _id: product._id,
                name: product.name,
                quantity: item.quantity,
                price: product.price,
                discount: isDiscountValid ? product.discount : 0,
                finalPrice: finalPrice,
                discountExpire: isDiscountValid
                  ? product.discountExpire
                  : undefined,
              };
            })
          ),
          shippingInfo,
          status: OrderStatus.Processing,
        },
      ],
      { session: transaction }
    );
    await sendEmailWithInvoice(user, invoice.hosted_invoice_url as string);
    await transaction.commitTransaction();

    return { success: true, orderId: order[0]._id, statusCode: 200 };
  } catch (error) {
    await transaction.abortTransaction();
    throw error;
  } finally {
    await transaction.endSession();
  }
};

// // Tax rate caching with TTL
// const getTaxRate = async (country: string) => {
//   const countryCode = country.toUpperCase();
//   const cacheKey = `taxRate:${countryCode}`;
//   const cached = await redis.get(cacheKey);

//   if (cached) return JSON.parse(cached);

//   const taxRate = await stripe.taxRates.create({
//     display_name: "Sales Tax",
//     description: `${feePercentage}% Tax`,
//     jurisdiction: countryCode,
//     percentage: feePercentage,
//     inclusive: false, // false means the tax is added on top of the pricing
//   });

//   await redis.set(cacheKey, JSON.stringify(taxRate), { ex: 3600 });
//   return taxRate;
// };

// Tax rate caching with TTL
const TAX_RATE_TTL = 3600; // 1 hour in seconds
const CACHE_PREFIX = "taxRate:";

const getTaxRate = async (country: string): Promise<string> => {
  const countryCode = country.toUpperCase();
  const cacheKey = `${CACHE_PREFIX}${countryCode}`;

  // Check cache for tax rate ID
  const cachedId = await redis.get<string>(cacheKey);
  if (cachedId) return cachedId;

  // Create new tax rate in Stripe
  const taxRate = await stripe.taxRates.create({
    display_name: "Sales Tax",
    description: `${feePercentage}% Tax`,
    jurisdiction: countryCode,
    percentage: feePercentage,
    inclusive: false,
  });

  // Cache only the tax rate ID
  await redis.setex(cacheKey, TAX_RATE_TTL, taxRate.id);

  return taxRate.id;
};
