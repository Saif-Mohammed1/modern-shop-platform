/* eslint-disable */

import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

import { OrderStatus } from "@/app/lib/types/orders.db.types";
import addressController from "@/app/server/controllers/address.controller";
import authController from "@/app/server/controllers/auth.controller";
import cartController from "@/app/server/controllers/cart.controller";
import productController from "@/app/server/controllers/product.controller";
import reviewController from "@/app/server/controllers/review.controller";
import stripeController from "@/app/server/controllers/stripe.controller";
import wishlistController from "@/app/server/controllers/wishlist.controller";
import type { IUserDB } from "../types/users.db.types";
import type { IProductDB } from "../types/products.db.types";

import orderController from "@/app/server/controllers/order.controller";
import type { CreateOrderDto } from "@/app/server/dtos/order.dto";
import type { ShippingInfoDto } from "@/app/server/dtos/stripe.dto";
// import type { IOrder } from "@/app/server/models/Order.model";
// import type { IProductDB } from "@/app/server/models/Product.model";
// import type { IUserDB } from "@/app/server/models/User.model";

// create a random user
// interface IUserDBInput {
//   name: string;
//   email: string;
//   password: string;
//   //   passwordConfirm: string | undefined;
//   emailVerify: boolean;
// }

export const createRandomUsers = async (count: number) => {
  const req = [];
  for (let i = 0; i < count; i++) {
    const ip = faker.internet.ipv4();
    const userAgent = faker.internet.userAgent();
    const randomName = faker.person.fullName(); // Rowan Nikolaus
    const randomEmail = faker.internet.email(); //
    const randomPassword = "Pa@password12345";
    const emailVerify = faker.datatype.boolean();
    // req.push({
    //   name: randomName,
    //   email: randomEmail,
    //   password: randomPassword,
    //   email_verified: emailVerify,
    // });

    const reqs = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/products`),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": userAgent,
          "x-client-ip": ip,
          "x-forwarded-for": ip,
        },
        method: "POST",
        body: JSON.stringify({
          name: randomName,
          email: randomEmail,
          password: randomPassword,
          confirmPassword: randomPassword,
          emailVerify: emailVerify,
        }),
      }
    );
    req.push(authController.register(reqs));
    //   // users.push({
    //   //   name: randomName,
    //   //   email: randomEmail,
    //   //   password: randomPassword,
    //   //   emailVerify: emailVerify,
    //   // });
  }
  // return req;
  const results = await Promise.allSettled(req);
  return results.map((result, index) => ({
    index,
    // email: req[index].email,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));
}; // create a random product

export const loginRandomUsers = async (count: number, usersId: IUserDB[]) => {
  const reqs = [];
  for (let i = 0; i < count; i++) {
    const ip = faker.internet.ipv4();
    const userAgent = faker.internet.userAgent();
    const randomEmail = usersId[i].email;
    console.log("randomEmail", randomEmail);
    const randomPassword = generateRandomPassword(
      faker.helpers.arrayElement(["valid", "invalid"])
    );
    const req = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/products`),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": userAgent,
          "x-client-ip": ip,
          "x-forwarded-for": ip,
        },
        method: "POST",
        body: JSON.stringify({
          email: randomEmail,
          password: randomPassword,
        }),
      }
    );
    reqs.push(authController.login(req));
  }
  const results = await Promise.allSettled(reqs);

  // Map results to include index and email for debugging
  return results.map((result, index) => ({
    index,
    email: usersId[index % usersId.length].email,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));
};
// interface IProductInput {
//   name: string;
//   category: string;
//   price: number;
//   discount?: number;
//   discount_expire?: Date;
//   images: { link: string; public_id: string }[];
//   user_id: string | null;
//   description: string;
//   stock: number;
//   ratings_average: number;
//   ratings_quantity: number;
//   active: boolean;
//   slug: string;
//   reserved: number;
//   lastReserved?: Date;
//   sold: number;

//   sku: string;
//   attributes: Record<string, any>;
//   shipping_info: {
//     weight: number;
//     dimensions: {
//       length: number;
//       width: number;
//       height: number;
//     };
//   };

//   //   created_at: Date;
// }
export const createRandomProducts = async (
  count: number,
  user_id: IUserDB[]
) => {
  const req = [];
  for (let i = 0; i < count; i++) {
    const images = [];
    const randomName = faker.commerce.productName(); // Rowan Nikolaus
    const randomCategory = faker.commerce.department();
    const randomPrice = parseFloat(faker.commerce.price());
    //  make it form 0 to randomPrice -1
    const randomDiscount = faker.number.float({ min: 0, max: randomPrice - 1 });
    const randomDiscountExpire = faker.date.future();
    for (let j = 0; j < faker.number.int({ min: 1, max: 4 }); j++) {
      const randomWidth = faker.number.int({ min: 100, max: 1000 });
      const randomHeight = faker.number.int({ min: 100, max: 1000 });
      const randomImage = faker.image.url({
        height: randomHeight,
        width: randomWidth,
      });
      images.push({ link: randomImage, public_id: randomImage });
    }
    const randomDescription = faker.commerce.productDescription(); //
    const randomStock = faker.number.int({ min: 0, max: 100 });
    const randomRating = faker.number.float({ min: 1, max: 5 });
    const randomRatingQuantity = faker.number.int({ min: 0, max: 100 });
    const slug = faker.helpers.slugify(randomName);
    const sku = faker.helpers.fromRegExp("[0-9]{9}");
    const attributes = {
      color: faker.color.human(),
      size: faker.commerce.productMaterial(),
      weight: faker.number.int({ min: 1, max: 10 }),
    };
    const shipping_info = {
      weight: faker.number.int({ min: 1, max: 10 }),
      dimensions: {
        length: faker.number.int({ min: 1, max: 10 }),
        width: faker.number.int({ min: 1, max: 10 }),
        height: faker.number.int({ min: 1, max: 10 }),
      },
    };
    const randomUserId = faker.helpers.arrayElement(user_id);
    const reqs = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/products`),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": faker.internet.userAgent(),
          "x-client-ip": faker.internet.ipv4(),
          "x-forwarded-for": faker.internet.ipv4(),
        },
        method: "POST",
        body: JSON.stringify({
          name: randomName,
          category: randomCategory,
          price: randomPrice,
          discount: randomDiscount,
          discount_expire: randomDiscountExpire,
          images,
          description: randomDescription,
          stock: randomStock,
          ratings_average: randomRating,
          ratings_quantity: randomRatingQuantity,
          slug,
          reserved: 0,
          sold: 0,
          sku,
          attributes,
          shipping_info,
          user_id: randomUserId["_id"],
        }),
      }
    );
    reqs.user = randomUserId;
    req.push(productController.createProduct(reqs));
  }
  const results = await Promise.allSettled(req);
  // Map results to include index and email for debugging
  return results.map((result, index) => ({
    index,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));
};
export const editRandomProducts = async (
  products: IProductDB[],
  user_id: IUserDB[]
) => {
  // const editedProducts = [] as IProductInput[];
  const req = [];
  for (let i = 0; i < products.length; i++) {
    const userAgent = faker.internet.userAgent();
    const ip = faker.internet.ipv4();
    const images = [];
    const randomName = faker.commerce.productName(); // Rowan Nikolaus
    const randomCategory = faker.commerce.department();
    const randomPrice = parseFloat(faker.commerce.price());
    const randomUserId = faker.helpers.arrayElement(user_id);
    //  make it form 0 to randomPrice -1
    const randomDiscount = faker.number.float({ min: 0, max: randomPrice - 1 });
    const randomDiscountExpire = faker.date.future();
    for (let j = 0; j < faker.number.int({ min: 1, max: 4 }); j++) {
      const randomWidth = faker.number.int({ min: 100, max: 1000 });
      const randomHeight = faker.number.int({ min: 100, max: 1000 });
      const randomImage = faker.image.url({
        height: randomHeight,
        width: randomWidth,
      });
      images.push({ link: randomImage, public_id: randomImage });
    }
    const randomDescription = faker.commerce.productDescription(); //
    const randomStock = faker.number.int({ min: 0, max: 100 });
    const randomRating = faker.number.float({ min: 1, max: 5 });
    const randomRatingQuantity = faker.number.int({ min: 0, max: 100 });
    const slug = faker.helpers.slugify(randomName);
    const sku = faker.helpers.fromRegExp("[0-9]{9}");
    const attributes = {
      color: faker.color.human(),
      size: faker.commerce.productMaterial(),
      weight: faker.number.int({ min: 1, max: 10 }),
    };
    const shipping_info = {
      weight: faker.number.int({ min: 1, max: 10 }),
      dimensions: {
        length: faker.number.int({ min: 1, max: 10 }),
        width: faker.number.int({ min: 1, max: 10 }),
        height: faker.number.int({ min: 1, max: 10 }),
      },
    };
    // editedProducts.push({
    //   name: randomName,
    //   category: randomCategory,
    //   price: randomPrice,
    //   discount: randomDiscount,
    //   discount_expire: randomDiscountExpire,
    //   images,
    //   description: randomDescription,
    //   stock: randomStock,
    //   ratings_average: randomRating,
    //   ratings_quantity: randomRatingQuantity,
    //   active: true,
    //   slug,
    //   reserved: 0,
    //   sold: 0,
    //   sku,
    //   attributes,
    //   shipping_info,
    //   user_id,
    // });
    const reqs = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/auth/products`),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": userAgent,
          "x-client-ip": ip,
          "x-forwarded-for": ip,
        },
        method: "POST",
        body: JSON.stringify({
          name: randomName,
          category: randomCategory,
          price: randomPrice,
          discount: randomDiscount,
          discount_expire: randomDiscountExpire,
          images,
          description: randomDescription,
          stock: randomStock,
          ratings_average: randomRating,
          ratings_quantity: randomRatingQuantity,
          active: true,
          slug,
          reserved: 0,
          sold: 0,
          sku,
          attributes,
          shipping_info,
          user_id: randomUserId["_id"],
        }),
      }
    );
    reqs.slug = products[i].slug;
    reqs.user = randomUserId;
    req.push(productController.updateProduct(reqs));
  }
  const results = await Promise.allSettled(req);
  // Map results to include index and email for debugging
  return results.map((result, index) => ({
    index,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));
};
export const createRandomReviews = async (
  product_id: IProductDB[],
  user_id: IUserDB[]
) => {
  // {
  //   [
  //     {
  //       user_id: "60f1b0b3b3b3b3b3b3b3b3b3",
  //       product_id: "60f1b0b3b3b3b3b3b3b3b3b3",
  //       rating: 4.5,
  //       comment: "This is a great product",
  //     },
  //   ];
  // }
  const req = [];
  for (let i = 0; i < product_id.length; i++) {
    for (let j = 0; j < user_id.length; j++) {
      const randomRating = faker.number.float({ min: 1, max: 5 });
      const randomReviewText = faker.lorem.sentence({ min: 5, max: 10 });
      const reqs = new NextRequest(
        new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/review`),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": faker.internet.userAgent(),
            "x-client-ip": faker.internet.ipv4(),
            "x-forwarded-for": faker.internet.ipv4(),
          },
          method: "POST",
          body: JSON.stringify({
            rating: randomRating,
            comment: randomReviewText,
          }),
        }
      );
      reqs.id = product_id[i]["_id"].toString();
      reqs.user = user_id[j];
      req.push(reviewController.createReview(reqs));
    }
  }
  const results = await Promise.allSettled(req);
  // Map results to include index and email for debugging
  return results.map((result, index) => ({
    index,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));
};

/* street: string;
  city: string;
  state: string;
  postal_code: number;
  phone: string;
  country: string;
  user: IUserDB["_id"];*/

export const createRandomAddresses = async (
  count: number,
  user_id: IUserDB[]
) => {
  const req = [];

  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const ip = faker.internet.ipv4();
      const userAgent = faker.internet.userAgent();
      const randomStreet = faker.location.street();
      const randomCity = faker.location.city();
      const randomState = faker.location.state();
      // const randomPostalCode = faker.location.zipCode();
      const randomPostalCode = faker.helpers.fromRegExp("[0-9]{9}");
      // const randomPhone = faker.phone.number();
      // /\+380\d{9}/
      const randomPhone = faker.helpers.fromRegExp("+380[0-9]{9}");
      const randomCountry = faker.location.country();
      const randomUser = user_id[i];

      const reqs = new NextRequest(
        new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/address`),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": userAgent,
            "x-client-ip": ip,
            "x-forwarded-for": ip,
          },
          method: "POST",
          body: JSON.stringify({
            street: randomStreet,
            city: randomCity,
            state: randomState,
            postal_code: randomPostalCode,
            phone: randomPhone,
            country: randomCountry,
          }),
        }
      );
      reqs.user = randomUser;
      req.push(addressController.addAddress(reqs));
      // addresses.push({
      //   street: randomStreet,
      //   city: randomCity,
      //   state: randomState,
      //   postal_code: randomPostalCode,
      //   phone: randomPhone,
      //   country: randomCountry,
      //   user: randomUser,
      // });
    }
  }
  await Promise.all(req);
};

export const createRandomOrders = async (
  count: number,
  product_id: IProductDB[],
  user_id: IUserDB[]
) => {
  // const orders: CreateOrderDto[] = [];
  // const _orders: Omit<
  //   IOrderDB & {
  //     items: Omit<IOrderItemDB, "_id" | "order_id">[];
  //     shipping_address: Omit<IOrderShippingAddressDB, "_id" | "order_id">;
  //   },
  //   "_id" | "updated_at"
  // >[] = [];
  const reqs = [] as any[];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomStreet = faker.location.street();
      const randomCity = faker.location.city();
      const randomState = faker.location.state();
      const randomPostalCode = faker.helpers.fromRegExp("[0-9]{9}");
      const randomPhone = faker.helpers.fromRegExp("+380[0-9]{9}");
      const randomCountry = faker.location.country();
      const randomUser = user_id[i]["_id"];
      const randomItems: CreateOrderDto["items"] = [];
      for (let k = 0; k < faker.number.int({ min: 1, max: 5 }); k++) {
        const randomProduct = faker.helpers.arrayElement(product_id);
        const randomQuantity = faker.number.int({ min: 1, max: 5 });
        const randomPrice = randomProduct.price;
        const randomDiscount = randomProduct.discount;
        const randomFinalPrice = randomPrice - randomDiscount;
        const randomShippingInfoWeight = faker.number.int({
          min: 1,
          max: 10,
        });
        const randomShippingInfoDimensions = {
          length: faker.number.int({ min: 1, max: 10 }),
          width: faker.number.int({ min: 1, max: 10 }),
          height: faker.number.int({ min: 1, max: 10 }),
        };
        randomItems.push({
          product_id: randomProduct._id,
          name: randomProduct.name,
          quantity: randomQuantity,
          price: randomPrice,
          discount: randomDiscount,
          final_price: randomFinalPrice,
          sku: randomProduct.sku,

          shipping_info: {
            weight: randomShippingInfoWeight,
            dimensions: randomShippingInfoDimensions,
          },
        });
      }
      const randomInvoiceId = faker.helpers.fromRegExp("[0-9]{9}");
      const randomInvoiceLink = faker.internet.url();
      const randomStatus = faker.helpers.arrayElement(
        Object.values(OrderStatus)
      );
      const randomTax = faker.number.float({ min: 0, max: 100 }); // in percentage
      const randomSubTotalPrice = randomItems.reduce((acc: number, item) => {
        return acc + (item.final_price * item.quantity || 1);
      }, 0);
      const randomTotalPrice =
        randomSubTotalPrice + (randomSubTotalPrice * randomTax) / 100;
      const ip = faker.internet.ipv4();
      const userAgent = faker.internet.userAgent();

      // orders.push({
      //   user_id: randomUser,
      //   shipping_address: {
      //     street: randomStreet,
      //     city: randomCity,
      //     state: randomState,
      //     postal_code: randomPostalCode,
      //     phone: randomPhone,
      //     country: randomCountry,
      //   },
      //   items: randomItems,
      //   status: randomStatus,
      //   invoice_id: randomInvoiceId,
      //   invoice_link: randomInvoiceLink,
      //   payment: {
      //     method: "credit_card",
      //     transaction_id: faker.helpers.fromRegExp("[0-9]{9}"),
      //   },
      //   subtotal: randomSubTotalPrice,
      //   tax: randomTax,
      //   total: randomTotalPrice,
      //   currency: "USD",
      //   created_at: faker.date.past(),
      // });
      const req = new NextRequest(
        new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/address`),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": userAgent,
            "x-client-ip": ip,
            "x-forwarded-for": ip,
          },
          method: "POST",
          body: JSON.stringify({
            user_id: randomUser,
            shipping_address: {
              street: randomStreet,
              city: randomCity,
              state: randomState,
              postal_code: randomPostalCode,
              phone: randomPhone,
              country: randomCountry,
            },
            items: randomItems,
            status: randomStatus,
            invoice_id: randomInvoiceId,
            invoice_link: randomInvoiceLink,
            payment: {
              method: "credit_card",
              transaction_id: faker.helpers.fromRegExp("[0-9]{9}"),
            },
            subtotal: randomSubTotalPrice,
            tax: randomTax,
            total: randomTotalPrice,
            currency: "USD",
            created_at: faker.date.past(),
          }),
        }
      );

      reqs.push(orderController.createOrder(req));
    }
  }
  const results = await Promise.allSettled(reqs);
  // Map results to include index and email for debugging
  return results.map((result, index) => ({
    index,
    status: result.status,
    value: result.status === "fulfilled" ? result.value : undefined,
    reason: result.status === "rejected" ? result.reason : undefined,
  }));

  // return orders;
};
/* user: IUserDB["_id"];
  product: IProductSchema["_id"];
  status: "pending" | "reviewing" | "completed";
  name: string;
  issue: string;
  message: string;*/
export const createRandomReport = (
  count: number,
  product_id: IProductDB[],
  user_id: IUserDB[]
) => {
  const data = [];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomProduct = faker.helpers.arrayElement(product_id);
      const randomUser = faker.helpers.arrayElement(user_id);
      const randomStatus = faker.helpers.arrayElement([
        "pending",
        "resolved",
        "rejected",
      ]);
      const randomName = faker.lorem.words();
      const randomIssue = faker.lorem.sentence();
      const randomMessage = faker.lorem.paragraph();
      // const reqs = new NextRequest(
      //   new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/report`),
      //   {
      //     headers: {
      //       "Content-Type": "application/json",
      //       Accept: "application/json",
      //       "User-Agent": faker.internet.userAgent(),
      //       "x-client-ip": faker.internet.ipv4(),
      //       "x-forwarded-for": faker.internet.ipv4(),
      //     },
      //     method: "POST",
      //     body: JSON.stringify({
      //       status: randomStatus,
      //       name: randomName,
      //       issue: randomIssue,
      //       message: randomMessage,
      //     }),
      //   }
      // );
      // reqs.user = randomUser;
      // reqs.id = randomProduct["_id"].toString();
      // req.push(reqs); /// not working

      data.push({
        _id: faker.string.uuid(),
        reporter_id: randomUser["_id"],
        product_id: randomProduct["_id"],
        status: randomStatus,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
        name: randomName,
        issue: randomIssue,
        message: randomMessage,
      });
    }
    // reports.push({
    //   user: randomUser["_id"],
    //   product: randomProduct["_id"],
    //   status: randomStatus,
    //   name: randomName,
    //   issue: randomIssue,
    //   message: randomMessage,
    // });
  }
  // if (req.length > 0) {
  //   await Promise.all(req);
  // }
  return data;
};

export const createRandomRefund = (count: number, user_id: IUserDB[]) => {
  const refunds = [] as any[];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = user_id[i]["_id"];
      const randomStatus = faker.helpers.arrayElement([
        "pending",
        "approved",
        "rejected",
      ]);
      const randomIssue = faker.lorem.words();
      const randomReason = faker.lorem.sentence();
      const randomAmount = faker.number.float({ min: 1, max: 1000 });
      const randomInvoiceId = faker.helpers.fromRegExp("[0-9]{9}");
      refunds.push({
        _id: faker.string.uuid(),
        user_id: randomUser,
        status: randomStatus,
        issue: randomIssue,
        reason: randomReason,
        amount: randomAmount,
        invoice_id: randomInvoiceId,
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      });
    }
  }
  return refunds;
};

export const createRandomCartItems = async (
  count: number,
  user_id: IUserDB[],
  product_id: IProductDB[]
) => {
  const req = [];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = user_id[i];
      // const randomProduct = faker.helpers.arrayElement(product_id);
      const randomProduct = product_id[j];
      const randomQuantity = faker.number.int({ min: 1, max: 5 });
      const reqs = new NextRequest(
        new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/cart`),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": faker.internet.userAgent(),
            "x-client-ip": faker.internet.ipv4(),
            "x-forwarded-for": faker.internet.ipv4(),
          },
          method: "POST",
          body: JSON.stringify({
            quantity: randomQuantity,
          }),
        }
      );
      reqs.user = randomUser;
      reqs.id = randomProduct["_id"].toString();
      req.push(cartController.addToCart(reqs));
      // cartItems.push({
      //   user_id: randomUser,
      //   product_id: randomProduct["_id"],
      //   quantity: randomQuantity,
      // });
    }
  }
  await Promise.all(req);
};
export const createRandomWishlistItems = async (
  count: number,
  user_id: IUserDB[],
  product_id: IProductDB[]
) => {
  const req = [];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = user_id[i];
      const randomProduct = product_id[j];
      // const randomProduct = faker.helpers.arrayElement(product_id);
      const reqs = new NextRequest(
        new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/wishlist`),
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": faker.internet.userAgent(),
            "x-client-ip": faker.internet.ipv4(),
            "x-forwarded-for": faker.internet.ipv4(),
          },
          method: "POST",
          body: JSON.stringify({
            product_id: randomProduct["_id"],
          }),
        }
      );
      reqs.user = randomUser;
      reqs.id = randomProduct["_id"].toString();
      req.push(wishlistController.toggleWishlist(reqs));
    }
  }
  await Promise.all(req);
};
export const createRandomMessages = (count: number, user_id: IUserDB[]) => {
  const messages = [] as any[];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = user_id[i]["_id"];
      const randomMessage = faker.lorem.paragraph();
      messages.push({
        user: randomUser,
        message: randomMessage,
      });
    }
  }
  return messages;
};
export const createRandomNotifications = (
  count: number,
  user_id: IUserDB[]
) => {
  const notifications = [] as any[];
  for (let i = 0; i < user_id.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = user_id[i]["_id"];
      const randomMessage = faker.lorem.sentence();
      notifications.push({
        user: randomUser,
        message: randomMessage,
      });
    }
  }
  return notifications;
};

export const createRandomStripeSession = async (
  user_id: IUserDB[],
  shipping_info: (ShippingInfoDto & {
    user_id: IUserDB["_id"];
  })[]
) => {
  const req = [];
  for (let i = 0; i < user_id.length; i++) {
    const findRelatedAddress = shipping_info.filter(
      (item) => String(item.user_id) === String(user_id[i]["_id"])
    );
    const randomShippingInfo = faker.helpers.arrayElement(findRelatedAddress);
    const randomUser = user_id[i];
    const reqs = new NextRequest(
      new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/stripe`),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": faker.internet.userAgent(),
          "x-client-ip": faker.internet.ipv4(),
          "x-forwarded-for": faker.internet.ipv4(),
        },
        method: "POST",
        body: JSON.stringify({ shipping_info: randomShippingInfo }),
      }
    );
    reqs.user = randomUser;
    req.push(stripeController.createStripeSession(reqs));
  }
  const results = [];

  // return await Promise.all(req);
  const responses = await Promise.all(req);
  for (const res of responses) {
    const response = await res.json();
    try {
      // 2. Automate checkout
      const success = await automateStripeCheckout(response.url);

      results.push({
        user_id,
        sessionId: response.sessionId,
        success,
        timestamp: new Date().toISOString(),
      });

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`Failed for user ${user_id}:`, error);
      results.push({
        user_id,
        success: false,
        error: error.message,
      });
    }
  }
  return responses;
};

const STRIPE_TEST_CARD = "4242424242424242"; // Standard test card
// const STRIPE_TEST_CVC = "123";
// const STRIPE_TEST_EXP = "12/34";

export const automateStripeCheckout = async (checkoutUrl: string) => {
  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Configure browser context
    await page.setUserAgent(faker.internet.userAgent());
    await page.setExtraHTTPHeaders({
      "x-client-ip": faker.internet.ipv4(),
      "x-forwarded-for": faker.internet.ipv4(),
    });

    // Navigate to Stripe checkout
    await page.goto(checkoutUrl, { waitUntil: "networkidle2" });

    // Wait for the payment form to be visible
    await page.waitForSelector(".App-Payment");
    // await page.waitForSelector("#cardNumber");
    const cardExpiryData = `${faker.number.int({
      min: 1,
      max: 12,
    })}/${faker.number.int({ min: 25, max: 35 })}`;
    // Fill payment details (No iframe required)
    await page.type("#cardNumber", STRIPE_TEST_CARD);
    await page.type("#cardExpiry", cardExpiryData);
    await page.type("#cardCvc", faker.helpers.fromRegExp("[0-9]{3}"));
    await page.type("#billingName", faker.person.fullName());

    // Submit payment
    await page.click(".SubmitButton");

    // Wait for success
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: 15000,
    });

    // Verify success
    if (page.url().includes("/success")) {
      console.log("Payment successful");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Checkout failed:", error);
    return false;
  } finally {
    await browser.close();
  }
};

// export const automateStripeCheckout = async (checkoutUrl: string) => {
//   const browser = await puppeteer.launch({
//     headless: false, // Set to true for CI/CD
//     args: ["--no-sandbox", "--disable-setuid-sandbox"],
//   });

//   try {
//     const page = await browser.newPage();

//     // Configure browser context
//     await page.setUserAgent(faker.internet.userAgent());
//     await page.setExtraHTTPHeaders({
//       "x-client-ip": faker.internet.ipv4(),
//       "x-forwarded-for": faker.internet.ipv4(),
//     });
//     // Navigate to Stripe checkout
//     await page.goto(checkoutUrl, { waitUntil: "networkidle2" });

//     // Fill payment details
//     // await page.waitForSelector(
//     //   'iframe[title="Secure card payment input frame"]'
//     // );
//     await page.waitForSelector('div[class="App-Payment is-noBackground"]');

//     const cardFrame = page
//       .frames()
//       .find((f) => f.url().includes("elements-inner-card"));

//     await cardFrame?.type('input[name="cardNumber"]', STRIPE_TEST_CARD);
//     await cardFrame?.type('input[name="cardExpiry"]', STRIPE_TEST_EXP);
//     await cardFrame?.type('input[name="cardCvc"]', STRIPE_TEST_CVC);
//     await cardFrame?.type('input[name="billingName"]', faker.person.fullName());

//     // Submit payment
//     // await page.click('button[type="submit"]');
//     await page.click(".SubmitButton-Icon");

//     // Wait for success
//     await page.waitForNavigation({
//       waitUntil: "networkidle2",
//       timeout: 15000,
//     });

//     // Verify success
//     if (page.url().includes("/success")) {
//       console.log("Payment successful");
//       return true;
//     }

//     return false;
//   } catch (error) {
//     console.error("Checkout failed:", error);
//     return false;
//   } finally {
//     await browser.close();
//   }
// };

// export const createAndTestStripeSession = async (
//   userIds: string[],
//   shipping_info: any[]
// ) => {
//   const results = [];

//   for (const user_id of userIds) {
//     try {
//       // 1. Create session
//       const sessionResponse = await stripeController.createStripeSession({
//         user: { _id: user_id },
//         body: { shipping_info: shipping_info[0] },
//       });

//       const { sessionId, url } = await sessionResponse.json();

//       // 2. Automate checkout
//       const success = await automateStripeCheckout(url);

//       results.push({
//         user_id,
//         sessionId,
//         success,
//         timestamp: new Date().toISOString(),
//       });

//       // Rate limiting
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     } catch (error: any) {
//       console.error(`Failed for user ${user_id}:`, error);
//       results.push({
//         user_id,
//         success: false,
//         error: error.message,
//       });
//     }
//   }

//   return results;
// };

// // Usage
// createAndTestStripeSession(['user1', 'user2'], [{}])
//   .then(results => console.log('Test results:', results))
//   .catch(console.error);
function generateRandomPassword(type: "valid" | "invalid" = "valid"): string {
  if (type === "valid") {
    const validPatterns = ["Pa@password12345"];
    return faker.helpers.arrayElement(validPatterns);
  } else {
    const invalidPatterns = [
      // Strong passwords
      `${faker.internet.username()}${faker.number.int(999)}@Aa`,
      `${faker.word.adjective()}${faker.number.int(999)}#Bb`,
      `${faker.color.human()}${faker.number.int(999)}$Cc`,
      // Fun but valid passwords
      "ILovePizza123@",
      "CoffeeTime456#",
      "DancingBanana789$",
      // Too short
      "Ab1@",
      // No special characters
      "Password123",
      // No numbers
      "Password@",
      // No uppercase
      "password@123",
      // No lowercase
      "PASSWORD@123",
      // Common passwords
      "admin123",
      "qwerty123",
      "welcome1",
    ];
    return faker.helpers.arrayElement(invalidPatterns);
  }
}

// Replace the static password with the new function
// ...existing code...

// ...existing code...
