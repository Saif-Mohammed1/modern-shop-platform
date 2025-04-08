// disable eslint checks
/* eslint-disable */
import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

import type { ProductType } from "@/app/lib/types/products.types";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";

import { stripeControllerTranslate } from "../../../public/locales/server/stripeControllerTranslate";
import Order from "../models/Order.model";
import Product from "../models/Product.model";
import User from "../models/User.model";

// import type { UserAuthType } from "@/app/lib/types/users.types";
const stripe = new Stripe(process.env.STRIPE_SECRET as string); // Replace `process.env.STRIPE_SECRET_KEY` with your actual secret key
const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
type ItemType = {
  quantity: number;
} & ProductType;
const taxRateCache = new Map<string, Stripe.TaxRate>();

export const createStripeProduct = async (req: NextRequest) => {
  const { products, shippingInfo } = await req.json();
  if (!shippingInfo) {
    throw new AppError(
      stripeControllerTranslate[
        lang
      ].functions.createStripeProduct.shippingInfo.noShippingInfo,
      400
    );
  }
  if (products.length === 0) {
    throw new AppError(
      stripeControllerTranslate[
        lang
      ].functions.createStripeProduct.products.noProducts,
      400
    );
  }
  const countryCode =
    shippingInfo.country.toUpperCase() || "Ukraine".toUpperCase();

  let taxRate = taxRateCache.get(countryCode);

  // Assuming 'products' is an array of product objects from the request body
  // Optionally, create a new tax rate or use an existing tax rate ID
  if (!taxRate) {
    taxRate = await stripe.taxRates.create({
      display_name: "Standard Tax",
      description: `${feePercentage}% Sales Tax`,
      jurisdiction: countryCode,

      percentage: feePercentage,
      inclusive: false, // false means the tax is added on top of the pricing
    });
    taxRateCache.set(countryCode, taxRate);
  }
  // const shippingRates = {
  //   USA: 500, // $5.00 in cents
  //   Egypt: 1500, // $15.00 in cents
  //   India: 1300, // $13.00 in cents
  //   Brazil: 1200, // $12.00 in cents
  //   UK: 700, // $7.00 in cents
  //   Germany: 800, // $8.00 in cents
  //   Australia: 1500, // $15.00 in cents
  //   Japan: 1000, // $10.00 in cents
  //   Canada: 500, // $5.00 in cents
  //   "South Africa": 1400, // $14.00 in cents
  //   default: 1000, // $10.00 in cents if country is not listed
  // };

  // Get the country specific shipping rate, or the default rate if country is not listed
  // const shippingCost =
  //   shippingRates[shippingInfo.country] || shippingRates["default"];

  const lineItemsPromises = products.map(async (item: ItemType) => {
    let product = await Product.findById(item._id);
    if (!product) {
      throw new AppError(
        stripeControllerTranslate[
          lang
        ].functions.createStripeProduct.productNotAvailableAnymore(item.name),
        // `Product ${item.name} is not available anymore please remove it from your cart for success payment `,
        400
      );
    }
    if (product.stock < item.quantity) {
      throw new AppError(
        stripeControllerTranslate[
          lang
        ].functions.createStripeProduct.insufficientStock(item.name),
        400
      );
    }

    if (product) {
      const unitAmount = Math.round(
        (product.discount &&
        product.discountExpire &&
        product.discountExpire > new Date()
          ? product.price - product.discount
          : product.price) * 100
      ); // Convert dollars to cents
      const id = product?._id.toString();
      const images = item.images.length > 0 ? [item.images[0].link] : [];
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images,
            metadata: { _id: id },
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
        tax_rates: [taxRate.id], // Attach the tax rate to each line item
      };
    }
    return null;
  });
  const lineItems = await Promise.all(lineItemsPromises);
  // lineItems.push({
  //   price_data: {
  //     currency: "usd",
  //     product_data: {
  //       name: `Shipping to ${shippingInfo.country}`,
  //       metadata: {
  //         description: `Shipping costs for ${shippingInfo.country}`,
  //       },
  //     },
  //     unit_amount: shippingCost,
  //   },
  //   quantity: 1,
  // });
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"], //, "alipay", "ideal", "sepa_debit", "paypal"],
    customer_email: req.user?.email,
    client_reference_id: req.user?._id.toString(), // This ensures receipt emails are set up
    line_items: lineItems.filter(Boolean),
    mode: "payment",
    success_url: `${req.headers.get("origin")}/account/orders/success`, //?session_id={CHECKOUT_SESSION_ID},
    cancel_url: `${req.headers.get("origin")}/account/orders/cancel`,
    payment_intent_data: {
      receipt_email: req.user?.email,
      shipping: {
        name: req.user?.name ?? "Unknown",
        address: {
          line1: shippingInfo.street,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: shippingInfo.postalCode,
          country: shippingInfo.country,
        },
      },
    },

    metadata: {
      // shipping_info: `Shipping cost: $${(shippingCost / 100).toFixed(2)} to ${
      //   shippingInfo.country
      // }`,
      shippingInfo: JSON.stringify(shippingInfo),
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
          stripeControllerTranslate[lang].functions.invoiceDetails.description,
        footer:
          stripeControllerTranslate[lang].functions.invoiceDetails.footer +
          process.env.COMPANY_MAIL,
        // You can add other fields as needed
      },
    },
  });
  return {
    sessionId: session.id,
    url: session.url,
    statusCode: 200,
  };
};

export const handleStripeWebhook = async (req: NextRequest) => {
  // const sig = req.headers["stripe-signature"];
  let event;

  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    throw Error;
  }
  const text = await req.text();

  event = stripe.webhooks.constructEvent(
    text, // Ensure you have access to the raw body in your request
    signature,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Call your existing captureSuccessPayment logic here
    return await captureSuccessPayment(String(session.id));
  }

  // Other webhook event types can be handled here

  return { received: true };
};

const captureSuccessPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(
    sessionId
    //    {
    //   expand: ["line_items"],
    // }
  );

  if (session.payment_status === "paid") {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price.product"],
    });

    const user = await User.findById(session.client_reference_id);

    if (!user) {
      throw new AppError(
        stripeControllerTranslate[lang].errors.noUserFound,
        400
      );
    }

    const invoiceDe = await stripe.invoices.retrieve(session.invoice as string);
    // const existingInvoice = await Order.findOne({
    //   invoiceId: invoiceDe.number,
    //   user: user._id,
    // });

    // const productsId = [];
    const items = [];
    // if (!existingInvoice) {
    for (const item of lineItems.data) {
      const productId = (item?.price?.product as Stripe.Product).metadata._id; // Assuming you stored _id in metadata
      const quantity = item.quantity ?? 1;
      const product = await Product.findById(productId);

      if (product) {
        const discountExpire =
          product.discountExpire && product.discountExpire < new Date()
            ? null
            : product.discountExpire;

        const discount =
          product.discount && discountExpire ? product.discount : 0;
        product.stock -= quantity;
        // productsId.push(productId);

        items.push({
          _id: product._id,
          name: product.name,
          quantity: quantity,
          price: product.price,
          discount,
          finalPrice: discount
            ? product.price - (product.discount ?? 0)
            : product.price,
          discountExpire,
        });
        await product.save();
      }
    }
    const totalPrice = items.reduce(
      (total, item) => total + item.finalPrice * (item.quantity ?? 1),
      0
    );

    const feeDecimal = feePercentage / 100;

    const fee = totalPrice * feeDecimal;
    const finalTotalPrice = totalPrice + fee;
    const existingShippingInfo = session?.metadata?.shippingInfo ?? null;
    const shippingInfo = existingShippingInfo
      ? JSON.parse(existingShippingInfo)
      : {
          street: "",
          city: "",
          state: "",
          postalCode: "",
          phone: "",
          country: "",
        };

    await Order.create({
      user: user?._id,
      invoiceId: invoiceDe.number,
      invoiceLink: invoiceDe.hosted_invoice_url,
      // amount: session.amount_total / 100,
      totalPrice: finalTotalPrice,
      items,
      shippingInfo: {
        street: shippingInfo.street,
        city: shippingInfo.city,
        state: shippingInfo.state,
        postalCode: shippingInfo.postalCode,
        phone: shippingInfo.phone,
        country: shippingInfo.country,
      },
    });
    // user.twoFactorEnabled = false;
    // await sendEmailWithInvoice(user, invoiceDe.hosted_invoice_url as string);
    return { session, statusCode: 200 };
  }
  // } else {
  throw new AppError(stripeControllerTranslate[lang].errors.failedPayment, 400);
  // }
};

// class StripeService {
//   private static stripe = new Stripe(process.env.STRIPE_SECRET!, {
//     apiVersion: "2020-08-27",
//     typescript: true,
//   });

//   private static FEE_PERCENTAGE =
//     Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE) || 0;
//   private static SHIPPING_RATES: Record<string, number> = {
//     US: 500,
//     CA: 500,
//     GB: 700,
//     DE: 800,
//     EG: 1500,
//     IN: 1300,
//     BR: 1200,
//     AU: 1500,
//     JP: 1000,
//     ZA: 1400,
//     DEFAULT: 1000,
//   };

//   private static taxRateCache = new Map<string, Stripe.TaxRate>();

//   public static async createStripeProduct(req: NextRequest) {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//
//       const { products, shippingInfo } = await req.json();
//       if (!shippingInfo?.country || !products?.length)
//         throw new AppError("Invalid input", 400);

//       const countryCode = shippingInfo.country.toUpperCase();
//       let taxRate = this.taxRateCache.get(countryCode);

//       if (!taxRate) {
//         taxRate = await this.stripe.taxRates.create({
//           display_name: "Sales Tax",
//           description: `${this.FEE_PERCENTAGE}% Tax`,
//           jurisdiction: countryCode,
//           percentage: this.FEE_PERCENTAGE,
//           inclusive: false,
//         });
//         this.taxRateCache.set(countryCode, taxRate);
//       }

//       const lineItems = await Promise.all(
//         products.map(async (item: ItemType) => {
//           const product = await Product.findById(item._id).session(session);
//           if (!product || product.stock < item.quantity)
//             throw new AppError(`Insufficient stock for ${item.name}`, 400);

//           product.stock -= item.quantity;
//           await product.save({ session });

//           return {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: product.name,
//                 images: product.images.slice(0, 1).map((img) => img.link),
//                 metadata: { _id: product._id.toString() },
//               },
//               unit_amount: Math.round(
//                 this.calculateFinalPrice(product as ProductType) * 100
//               ),
//             },
//             quantity: item.quantity,
//             tax_rates: [taxRate.id],
//           };
//         })
//       );

//       lineItems.push(this.createShippingLineItem(shippingInfo.country));

//       const stripeSession = await this.stripe.checkout.sessions.create({
//         payment_method_types: ["card"],
//         mode: "payment",
//         customer_email: req.user?.email,
//         client_reference_id: req.user?._id.toString(),
//         line_items: lineItems,
//         success_url: `${req.headers.get("origin")}/account/orders/success`,
//         cancel_url: `${req.headers.get("origin")}/account/orders/cancel`,
//         metadata: { shippingInfo: JSON.stringify(shippingInfo) },
//         payment_intent_data: {
//           shipping: this.formatShippingData(req.user, shippingInfo),
//         },
//         invoice_creation: { enabled: true },
//       });

//       await session.commitTransaction();
//       return {
//         sessionId: stripeSession.id,
//         url: stripeSession.url,
//         statusCode: 200,
//       };
//     } catch (error) {
//       await session.abortTransaction();
//       logger.error("Checkout session failed", error);
//       throw new AppError("Payment processing failed", 500);
//     } finally {
//             await session.endSession();

//     }
//   }

//   public static async handleStripeWebhook(req: NextRequest) {
//     const sig = headers().get("stripe-signature")!;
//     const rawBody = await req.text();

//
//       const event = this.stripe.webhooks.constructEvent(
//         rawBody,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//       if (event.type === "checkout.session.completed") {
//         await this.handleSuccessfulPayment(event.data.object);
//       }
//       return { received: true };
//     } catch (err) {
//       logger.error("Webhook error", err);
//       throw new AppError("Invalid webhook signature", 400);
//     }
//   }

//   private static async handleSuccessfulPayment(
//     session: Stripe.Checkout.Session
//   ) {
//     const dbSession = await mongoose.startSession();
//     dbSession.startTransaction();

//
//       const user = await User.findById(session.client_reference_id).session(
//         dbSession
//       );
//       if (!user) throw new AppError("User not found", 404);

//       const [lineItems, invoice] = await Promise.all([
//         this.stripe.checkout.sessions.listLineItems(session.id, {
//           expand: ["data.price.product"],
//         }),
//         this.stripe.invoices.retrieve(session.invoice as string),
//       ]);

//       const orderItems = await this.processOrderItems(
//         lineItems.data,
//         dbSession
//       );
//       const orderTotal = this.calculateOrderTotal(orderItems);

//       await new Order({
//         user: user._id,
//         invoiceId: invoice.number,
//         totalPrice: orderTotal,
//         items: orderItems,
//         shippingInfo: JSON.parse(session.metadata!.shippingInfo),
//       }).save({ session: dbSession });

//       await this.sendInvoiceEmail(user, invoice.hosted_invoice_url!);
//       await dbSession.commitTransaction();
//     } catch (error) {
//       await dbSession.abortTransaction();
//       logger.error("Order processing failed", error);
//       throw error;
//     } finally {
//       dbSession.endSession();
//     }
//   }

//   private static calculateFinalPrice(product: ProductType) {
//     const hasValidDiscount =
//       product.discountExpire && new Date(product.discountExpire) > new Date();
//     return hasValidDiscount
//       ? product.price - (product.discount || 0)
//       : product.price;
//   }

//   private static createShippingLineItem(country: string) {
//     const shippingCost =
//       this.SHIPPING_RATES[country.toUpperCase()] || this.SHIPPING_RATES.DEFAULT;
//     return {
//       price_data: {
//         currency: "usd",
//         product_data: { name: `Shipping to ${country}` },
//         unit_amount: shippingCost,
//       },
//       quantity: 1,
//     };
//   }

//   private static formatShippingData(user: UserAuthType, shippingInfo: any) {
//     return {
//       name: user.name || "Customer",
//       address: {
//         line1: shippingInfo.street,
//         city: shippingInfo.city,
//         state: shippingInfo.state,
//         postal_code: shippingInfo.postalCode,
//         country: shippingInfo.country,
//       },
//     };
//   }

//   private static async processOrderItems(
//     items: Stripe.LineItem[],
//     session: mongoose.ClientSession
//   ) {
//     return Promise.all(
//       items.map(async (item) => {
//         const product = await Product.findById(
//           (item.price?.product as Stripe.Product).metadata._id
//         ).session(session);
//         return {
//           productId: product!._id,
//           name: product!.name,
//           quantity: item.quantity || 1,
//           price: item.price!.unit_amount! / 100,
//           discount: product!.discount || 0,
//         };
//       })
//     );
//   }

//   private static async sendInvoiceEmail(
//     user: UserAuthType,
//     invoiceUrl: string
//   ) {
//
//       await sendEmailWithInvoice(user, invoiceUrl);
//     } catch (emailError) {
//       logger.error("Failed to send invoice email", emailError);
//       // Consider implementing a retry mechanism or logging the issue to a monitoring service
//     }
//   }
// }

// export default StripeService;
// export class StripeService {
//   private userCartService = new CartService();
//   private productService = new ProductService();

//   async createStripeSession(
//     user: IUser,
//     shippingInfo: ShippingInfoDto
//   ): Promise<{ sessionId: string; url: string }> {
//     const transaction = await mongoose.startSession();
//     transaction.startTransaction();
//
//       const userCart = await this.userCartService.getMyCart(
//         user._id.toString(),
//         transaction
//       );
//       if (!userCart.length) {
//         throw new AppError(
//           stripeControllerTranslate[lang].errors.cartEmpty,
//           400
//         );
//       }
//       // Reserve inventory
//       await this.reserveInventory(
//         userCart.map((p) => ({ _id: p._id, quantity: p.quantity })),
//         user,
//         transaction
//       );

//       // Generate idempotency key
//       const idempotencyKey = crypto
//         .createHash("sha256")
//         .update(JSON.stringify({ userCart, shippingInfo, user: user._id }))
//         .digest("hex");

//       // Check for cached session
//       // Check for cached session with proper type handling
//       // Modify the session retrieval logic
//       const cachedSession = await redis.get<any>(idempotencyKey); // Use 'any' type temporarily
//       if (cachedSession) {
//         // Handle both string and object cases
//         if (typeof cachedSession === "string") {
//           return JSON.parse(cachedSession);
//         }
//         return cachedSession;
//       }

//       // Create Stripe session
//       const lineItems = await Promise.all(
//         userCart.map(async (item) => {
//           const product = await this.productService.getProductById(
//             item._id.toString(),
//             transaction
//           );
//           //   const product = await Product.findById(item._id).session(transaction);
//           if (!product)
//             throw new AppError(
//               stripeControllerTranslate[lang].errors.notFoundProduct(item.name),

//               404
//             );

//           const price =
//             product.discountExpire && product.discountExpire > new Date()
//               ? product.price - (product.discount || 0)
//               : product.price;

//           return {
//             price_data: {
//               currency: "usd",
//               product_data: {
//                 name: product.name,
//                 images: product.images.slice(0, 1).map((img) => img.link),
//                 metadata: { _id: product._id.toString() },
//               },
//               unit_amount: Math.round(price * 100),
//             },
//             quantity: item.quantity,
//             tax_rates: [await this.getTaxRate(shippingInfo.country)],
//           };
//         })
//       );
//       const BASE_URL = new URL(process.env.NEXTAUTH_URL!);
//       const successUrl = new URL(
//         "/account/orders/success",
//         BASE_URL
//       ).toString();
//       const cancelUrl = new URL("/account/orders/cancel", BASE_URL).toString();

//       const session = await stripe.checkout.sessions.create(
//         {
//           payment_method_types: ["card"],
//           mode: "payment",
//           customer_email: user.email,
//           client_reference_id: user._id.toString(),
//           line_items: lineItems,
//           // success_url: `${process.env.NEXTAUTH_URL}/account/orders/success`,
//           // cancel_url: `${process.env.NEXTAUTH_URL}/account/orders/cancel`,

//           success_url: successUrl,
//           cancel_url: cancelUrl,
//           payment_intent_data: {
//             receipt_email: user?.email,
//             shipping: {
//               name: user?.name ?? "Unknown",
//               address: {
//                 line1: shippingInfo.street,
//                 city: shippingInfo.city,
//                 state: shippingInfo.state,
//                 postal_code: shippingInfo.postalCode,
//                 country: shippingInfo.country,
//               },
//             },
//           },
//           invoice_creation: {
//             enabled: true,
//             invoice_data: {
//               custom_fields: [
//                 {
//                   name: stripeControllerTranslate[lang].functions.invoiceDetails
//                     .custom_fields.name,
//                   value:
//                     stripeControllerTranslate[lang].functions.invoiceDetails
//                       .custom_fields.value,
//                 },
//               ],
//               description:
//                 stripeControllerTranslate[lang].functions.invoiceDetails
//                   .description,
//               footer:
//                 stripeControllerTranslate[lang].functions.invoiceDetails
//                   .footer + process.env.COMPANY_MAIL,
//               // You can add other fields as needed
//             },
//           },
//           metadata: {
//             shippingInfo: JSON.stringify(shippingInfo),
//             idempotencyKey,
//             reservationTimeout: Date.now() + RESERVATION_TIMEOUT * 1000,
//           },
//         },
//         { idempotencyKey }
//       );

//       // Cache session and commit transaction
//       await redis.set(
//         idempotencyKey,
//         JSON.stringify({
//           sessionId: session.id,
//           url: session.url!,
//         }),
//         { ex: RESERVATION_TIMEOUT }
//       );

//       await transaction.commitTransaction();
//       return {
//         sessionId: session.id,
//         url: session.url!,
//       };
//     } catch (error) {
//       await transaction.abortTransaction();

//       throw error;
//     } finally {
//       await transaction.endSession();
//     }
//   }
//   async stripeWebhook(signature: string, rawBody: string) {
//
//       const event = stripe.webhooks.constructEvent(
//         rawBody,
//         signature,
//         process.env.STRIPE_WEBHOOK_SECRET!
//       );
//       console.log(event);
//       switch (event.type) {
//         case "checkout.session.completed":
//           const session = event.data.object as Stripe.Checkout.Session;
//           const lockKey = `order:${session.id}`;

//           if (!(await this.acquireLock(lockKey))) {
//             throw new AppError("Concurrent order processing detected", 409);
//           } // Handle successful payment
//           await this.handleCheckoutSuccess(session);
//           break;
//         default:
//           console.log(`Unhandled event type: ${event.type}`);
//       }
//     } catch (error) {
//       console.error(error);
//       throw new AppError("Invalid webhook signature", 400);
//     } finally {
//       await this.releaseLock(lockKey);
//     }
//   }
//   async handleCheckoutSuccess(session: Stripe.Checkout.Session) {
//     const transaction = await mongoose.startSession();
//     transaction.startTransaction();
//
//       const
// session = await stripe.checkout.sessions.retrieve(sessionId);
// const session = await stripe.checkout.sessions.retrieve(sessionId);
//         user
//         //
//         = await UserModel.findById(session.client_reference_id).session(
//           transaction
//         );
//       if (!user) {
//         throw new AppError(
//           AuthTranslate[lang].errors.userNotFound,
//           404
//         );
//       }
//       const shippingInfo = JSON.parse(
//         session.metadata.shippingInfo
//       ) as ShippingInfoDto;
//       const userCart = await this.userCartService.getMyCart(
//         user._id.toString(),
//         transaction
//       );
//       if (!userCart.length) {
//         throw new AppError(
//           stripeControllerTranslate[lang].errors.cartEmpty,
//           400
//         );
//   // Distributed locking functions
//   async acquireLock(key: string, ttl: number = RESERVATION_TIMEOUT) {
//     return await redis.set(key, "locked", { nx: true, ex: ttl });
//   }

//   async releaseLock(key: string) {
//     await redis.del(key);
//   }
//   private async reserveInventory(
//     products: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>,
//     user: IUser,
//     session: mongoose.ClientSession
//   ) {
//     const bulkOps = products.map(({ _id, quantity }) => ({
//       updateOne: {
//         filter: {
//           _id: new mongoose.Types.ObjectId(_id),
//           stock: { $gte: quantity },
//           $expr: { $lt: ["$reserved", "$stock"] },
//         },
//         update: {
//           $inc: { reserved: quantity },
//           $set: { lastReserved: new Date(), lastModifiedBy: user._id },
//         },
//       },
//     }));

//     const result = await ProductModel.bulkWrite(bulkOps, { session });
//     if (result.modifiedCount !== products.length) {
//       // const successfulIds = result.modifiedCount;
//       // const failedProducts = products.filter(
//       //   (p) => !result.upsertedIds[p._id.toString()]
//       // );

//       throw new AppError(
//         stripeControllerTranslate[lang].errors.InventoryError,
//         409
//       );
//     }

//     // Log successful reservation
//     // await this.productService.logAction(AuditAction.INVENTORY_RESERVATION
//     //   userId: user._id,
//     //   targetIds: products.map((p) => p._id),
//     //   metadata: {
//     //     quantities: products.map((p) => p.quantity),

//     // });
//   }
//   async getTaxRate(country: string): Promise<string> {
//     const countryCode = country.toUpperCase();
//     const cacheKey = `${CACHE_PREFIX}${countryCode}`;

//     // Check cache for tax rate ID
//     const cachedId = await redis.get<string>(cacheKey);
//     if (cachedId) return cachedId;

//     // Create new tax rate in Stripe
//     const taxRate = await stripe.taxRates.create({
//       display_name: "Sales Tax",
//       description: `${feePercentage}% Tax`,
//       jurisdiction: countryCode,
//       percentage: feePercentage,
//       inclusive: false,
//     });

//     // Cache only the tax rate ID
//     await redis.setex(cacheKey, TAX_RATE_TTL, taxRate.id);

//     return taxRate.id;
//   }
//   // private async notifyAdminPartialFailure(
//   //   user: IUser,
//   //   failedProducts: Array<{ _id: mongoose.Types.ObjectId; quantity: number }>
//   // ) {
//   //   const admins = await UserModel.find({ role: 'admin' }).lean();

//   //   await NotificationQueue.add({
//   //     type: 'INVENTORY_ALERT',
//   //     recipients: admins.map(a => a._id),
//   //     content: {
//   //       subject: `Partial Reservation Failure - ${user.email}`,
//   //       body: `Failed to reserve ${failedProducts.length} items`,
//   //       metadata: {
//   //         user: user._id,
//   //         failedProducts
//   //       }
//   //     },
//   //     priority: 'high'
//   //   });
//   // }
// }
/** //   static async createCheckoutSession(
  //     amount: number,
  //     currency: string,
  //     successUrl: string,
  //     cancelUrl: string,
  //     metadata: any
  //   ) {
  //     const session = await stripe.checkout.sessions.create({
  //       payment_method_types: ["card"],
  //       line_items: [
  //         {
  //           price_data: {
  //             currency,
  //             product_data: {
  //               name: "Reservation",
  //             },
  //             unit_amount: amount,
  //           },
  //           quantity: 1,
  //         },
  //       ],
  //       mode: "payment",
  //       success_url: successUrl,
  //       cancel_url: cancelUrl,
  //       metadata,
  //     });

  //     return session;
  //   }

  //   static async createPaymentIntent(
  //     amount: number,
  //     currency: string,
  //     paymentMethod: string,
  //     customerId: string,
  //     metadata: any
  //   ) {
  //     const paymentIntent = await stripe.paymentIntents.create({
  //       amount,
  //       currency,
  //       payment_method: paymentMethod,
  //       customer: customerId,
  //       metadata,
  //       application_fee_amount: Math.round(amount * feePercentage),
  //       transfer_data: {
  //         destination: metadata.sellerId,
  //       },
  //     });

  //     return paymentIntent;
  //   }

  //   static async createPaymentMethod(
  //     card: any,
  //     customerId: string,
  //     metadata: any
  //   ) {
  //     const paymentMethod = await stripe.paymentMethods.create({
  //       type: "card",
  //       card,
  //     });

  //     await stripe.paymentMethods.attach(paymentMethod.id, {
  //       customer: customerId,
  //     });

  //     return paymentMethod;
  //   }

  //   static async createCustomer(email: string) {
  //     const customer = await stripe.customers.create({
  //       email,
  //     });

  //     return customer;
  //   }

  //   static async createAccountLink(accountId: string) {
  //     const accountLink = await stripe.accountLinks.create({
  //       account: accountId,
  //       refresh_url: `${process.env.NEXT_PUBLIC_URL}/account`,
  //       return_url: `${process.env.NEXT_PUBLIC_URL}/account`,
  //       type: "account_onboarding",
  //     });

  //     return accountLink;
  //   }

  //   static async createAccount(email: string) {
  //     const account = await stripe.accounts.create({
  //       type: "express",
  //       email,
  //       capabilities: {
  //         card_payments: { requested: true },
  //         transfers: { requested: true },
  //       },
  //     });

  //     return account;
  //   }

  //   static async createTransfer(
  //     amount: number,
  //     currency: string,
  //     destination: string
  //   ) {
  //     const transfer = await stripe.transfers.create({
  //       amount,
  //       currency,
  //       destination,
  //     });
  //   } */
//  private async releaseReservedInventory(idempotencyKey: string) {
//     const reservationKey = `reservation:${idempotencyKey}`;
//     const products = await redis.get(reservationKey);
//     if (!products) return;

//
//       const parsedProducts = JSON.parse(products);
//       await ProductModel.bulkWrite(
//         parsedProducts.map((p: any) => ({
//           updateOne: {
//             filter: { _id: p._id },
//             update: { $inc: { reserved: -p.quantity } },
//           },
//         }))
//       );
//       await redis.del(reservationKey);
//     } catch (error) {
//       console.error("Failed to release inventory:", error);
//     }
//   }

//   private async reconcileInventory() {
//     let cursor = "0";
//     do {
//       const [newCursor, keys] = await redis.scan(
//         cursor,
//         "MATCH",
//         "reservation:*",
//         "COUNT",
//         100
//       );

//       for (const key of keys) {
//         const reservation = await redis.get(key);
//         if (!reservation) continue;

//
//           const { sessionId, expiresAt } = JSON.parse(reservation);
//           if (Date.now() > expiresAt) {
//             await this.releaseExpiredReservation(key, sessionId);
//           }
//         } catch (e) {
//           await redis.del(key);
//         }
//       }
//       cursor = newCursor;
//     } while (cursor !== "0");
//   }

//   async createStripeSession(
//   user: IUser,
//   shippingInfo: ShippingInfoDto
// ): Promise<{ sessionId: string; url: string }> {
//   await this.validateEnvironment();
//   const transaction = await mongoose.startSession();
//   transaction.startTransaction();

//
//     const BASE_URL = new URL(process.env.NEXTAUTH_URL!);

//     // 1. Get and validate cart FIRST
//     let userCart = await this.userCartService.getMyCart(user._id.toString());
//     if (userCart.length === 0) throw new AppError("Cart is empty", 400);

//     // 2. Validate products and remove invalid items
//     const { validProducts, invalidProducts } = await this.validateCartProducts(userCart);
//     if (invalidProducts.length > 0) {
//       await this.handleInvalidCartItems(user._id.toString(), invalidProducts);
//       userCart = userCart.filter(item =>
//         !invalidProducts.includes(item._id.toString())
//       );
//     }

//     // 3. Generate idempotency key AFTER validation
//     const idempotencyKey = crypto
//       .createHash("sha256")
//       .update(JSON.stringify({
//         userCart,
//         shippingInfo,
//         user: user._id
//       }))
//       .digest("hex");

//     // 4. Check cache AFTER key generation
//     const cachedSession = await this.getCachedSession(idempotencyKey);
//     if (cachedSession) return cachedSession;

//     // 5. Reserve inventory with FINAL cart state
//     const reservationId = uuidv4();
//     await this.reserveInventoryWithRetry(
//       userCart,
//       user,
//       reservationId,
//       transaction
//     );

//     // 6. Create session with VALIDATED cart
//     const session = await this.createStripeCheckoutSession(
//       user,
//       userCart,
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
//     await transaction.endSession();
//   }
// }
