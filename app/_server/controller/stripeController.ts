import AppError from "@/components/util/appError";
import Stripe from "stripe";
import Product from "../models/product.model";
import Order from "../models/order.model ";
import { sendEmailWithInvoice } from "@/components/util/email";
import { headers } from "next/headers";
import User from "../models/user.model";
import type { NextRequest } from "next/server";
import { stripeControllerTranslate } from "../_Translate/stripeControllerTranslate";
import { lang } from "@/components/util/lang";
import { ProductType } from "@/app/types/products.types";
const stripe = new Stripe(process.env.STRIPE_SECRET as string); // Replace `process.env.STRIPE_SECRET_KEY` with your actual secret key
const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
type ItemType = {
  quantity: number;
} & ProductType;
const taxRateCache = new Map<string, Stripe.TaxRate>();

export const createStripeProduct = async (req: NextRequest) => {
  try {
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
        description: feePercentage + "% Sales Tax",
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
            stripeControllerTranslate[lang].functions.invoiceDetails
              .description,
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
  } catch (error) {
    throw error; // throw new AppError("Error creating products", 500);
  }
};

export const handleStripeWebhook = async (req: NextRequest) => {
  // const sig = req.headers["stripe-signature"];
  let event;

  try {
    const signature = headers().get("stripe-signature");
    if (!signature) {
      throw Error;
    }
    const text = await req.text();

    event = stripe.webhooks.constructEvent(
      text, // Ensure you have access to the raw body in your request
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    throw new AppError(
      stripeControllerTranslate[lang].functions.handleStripeWebhook.error,
      400
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    // Call your existing captureSuccessPayment logic here
    return await captureSuccessPayment(String(session.id));
  }

  // Other webhook event types can be handled here

  return { received: true };
};

const captureSuccessPayment = async (sessionId: string) => {
  let order;
  try {
    const session = await stripe.checkout.sessions.retrieve(
      sessionId
      //    {
      //   expand: ["line_items"],
      // }
    );

    if (session.payment_status === "paid") {
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id,
        {
          expand: ["data.price.product"],
        }
      );

      const user = await User.findById(session.client_reference_id);

      if (!user) {
        throw new AppError(
          stripeControllerTranslate[lang].errors.noUserFound,
          400
        );
      }

      const invoiceDe = await stripe.invoices.retrieve(
        session.invoice as string
      );
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

      order = await Order.create({
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
      await sendEmailWithInvoice(user, invoiceDe.hosted_invoice_url as string);
      return { session, statusCode: 200 };
    }
    // } else {
    throw new AppError(
      stripeControllerTranslate[lang].errors.failedPayment,
      400
    );
    // }
  } catch (error) {
    if (order) {
      await Order.findByIdAndDelete(order._id);
    }
    throw error;
  }
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

//     try {
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
//       session.endSession();
//     }
//   }

//   public static async handleStripeWebhook(req: NextRequest) {
//     const sig = headers().get("stripe-signature")!;
//     const rawBody = await req.text();

//     try {
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

//     try {
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
//     try {
//       await sendEmailWithInvoice(user, invoiceUrl);
//     } catch (emailError) {
//       logger.error("Failed to send invoice email", emailError);
//       // Consider implementing a retry mechanism or logging the issue to a monitoring service
//     }
//   }
// }

// export default StripeService;
