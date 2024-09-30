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
import { ProductType } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
const stripe = new Stripe(process.env.STRIPE_SECRET as string); // Replace `process.env.STRIPE_SECRET_KEY` with your actual secret key
const feePercentage = Number(process.env.NEXT_PUBLIC_FEES_PERCENTAGE ?? 0);
type ItemType = {
  quantity: number;
} & ProductType;
// no need for this function
// const fetchActiveProducts = async () => {
//   try {
//     const products = await stripe.products.list(); // Use the stripe client instance to call the API
//     const activeProducts = products.data.filter((product) => product.active);
//     return activeProducts;
//   } catch (error) {
//     throw new AppError(
//       stripeControllerTranslate[lang].functions.fetchActiveProducts.message,
//       400
//     );
//   }
// };

export const createStripeProduct = async (req: NextRequest) => {
  try {
    const { products, shippingInfo } = await req.json(); // Assuming 'products' is an array of product objects from the request body
    // Optionally, create a new tax rate or use an existing tax rate ID
    const taxRate = await stripe.taxRates.create({
      display_name: "Standard Tax",
      description: feePercentage + "% Sales Tax",
      jurisdiction: shippingInfo.country || "Ukraine",
      percentage: feePercentage,
      inclusive: false, // false means the tax is added on top of the pricing
    });

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

// export const captureSuccessPayment = async (req, sessionId) => {
//   let doc;
//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     // Process the payment session details
//     const { payment_status, invoice } = session;

//     if (payment_status === "paid" && invoice) {
//       const lineItems = await stripe.checkout.sessions.listLineItems(
//         session.id,
//         {
//           expand: ["data.price.product"],
//         }
//       );

//       const invoiceDe = await stripe.invoices.retrieve(invoice);
//       const existingInvoice = await Order.findOne({
//         invoiceId: invoiceDe.number,
//         user: req?.user?._id,
//       });

//       if (!existingInvoice) {
//         lineItems.data.forEach(async (item) => {
//           const productId = item.price.product.metadata._id; // Assuming you stored _id in metadata
//           const quantity = item.quantity;
//           const product = await Product.findById(productId);

//           if (product) {
//             product.stock -= quantity;
//             await product.save();
//           }
//         });
//         const shippingId = JSON.parse(session.metadata.shippingInfo)._id;

//         doc = await Order.create({
//           user: req?.user?._id,
//           invoiceId: invoiceDe.number,
//           invoiceLink: invoiceDe.hosted_invoice_url,
//           amount: session.amount_total / 100,

//           shippingInfo: shippingId,
//         });
//         await sendEmailWithInvoice(req?.user, invoiceDe.hosted_invoice_url);
//         return { session, statusCode: 200 };
//       }
//     } else {
//       throw new AppError("you need to complete your payment", 400);
//     }
//     return { data: null, statusCode: 200 };
//   } catch (error) {
//     //console.log("error", error);
//     if (doc) {
//       await Order.findByIdAndDelete(doc._id);
//     }
//     throw error//   }
// };
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
