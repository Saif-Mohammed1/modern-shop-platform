import { OrderStatus } from "@/app/lib/types/orders.types";
import { faker } from "@faker-js/faker";
import { NextRequest } from "next/server";
import productController from "@/app/server/controllers/product.controller";
import type { IUser } from "@/app/server/models/User.model";
import authController from "@/app/server/controllers/auth.controller";
import addressController from "@/app/server/controllers/address.controller";
import reviewController from "@/app/server/controllers/review.controller";
import cartController from "@/app/server/controllers/cart.controller";
import wishlistController from "@/app/server/controllers/wishlist.controller";
import stripeController from "@/app/server/controllers/stripe.controller";
import puppeteer from "puppeteer";

// create a random user
// interface IUserInput {
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
    const reqs = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/products"),
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
    // users.push({
    //   name: randomName,
    //   email: randomEmail,
    //   password: randomPassword,
    //   emailVerify: emailVerify,
    // });
  }
  await Promise.all(req);
}; // create a random product

export const loginRandomUsers = async (count: number, usersId: any[]) => {
  const req = [];
  for (let i = 0; i < count; i++) {
    const ip = faker.internet.ipv4();
    const userAgent = faker.internet.userAgent();
    const randomEmail = usersId[i].email;
    console.log("randomEmail", randomEmail);
    const randomPassword = "Pa@password12345";
    const reqs = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/products"),
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
    req.push(authController.login(reqs));
  }
  await Promise.all(req);
};
// interface IProductInput {
//   name: string;
//   category: string;
//   price: number;
//   discount?: number;
//   discountExpire?: Date;
//   images: { link: string; public_id: string }[];
//   userId: string | null;
//   description: string;
//   stock: number;
//   ratingsAverage: number;
//   ratingsQuantity: number;
//   active: boolean;
//   slug: string;
//   reserved: number;
//   lastReserved?: Date;
//   sold: number;

//   sku: string;
//   attributes: Record<string, any>;
//   shippingInfo: {
//     weight: number;
//     dimensions: {
//       length: number;
//       width: number;
//       height: number;
//     };
//   };

//   //   createdAt: Date;
// }
export const createRandomProducts = async (count: number, userId: any[]) => {
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
    const shippingInfo = {
      weight: faker.number.int({ min: 1, max: 10 }),
      dimensions: {
        length: faker.number.int({ min: 1, max: 10 }),
        width: faker.number.int({ min: 1, max: 10 }),
        height: faker.number.int({ min: 1, max: 10 }),
      },
    };
    const randomUserId = faker.helpers.arrayElement(userId);
    const reqs = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/products"),
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
          discountExpire: randomDiscountExpire,
          images,
          description: randomDescription,
          stock: randomStock,
          ratingsAverage: randomRating,
          ratingsQuantity: randomRatingQuantity,
          slug,
          reserved: 0,
          sold: 0,
          sku,
          attributes,
          shippingInfo,
          userId,
        }),
      }
    );
    reqs.user = randomUserId;
    req.push(productController.createProduct(reqs));
  }
  await Promise.all(req);
};
export const editRandomProducts = async (products: any[], userId: IUser[]) => {
  // const editedProducts = [] as IProductInput[];
  const req = [];
  for (let i = 0; i < products.length; i++) {
    const userAgent = faker.internet.userAgent();
    const ip = faker.internet.ipv4();
    const images = [];
    const randomName = faker.commerce.productName(); // Rowan Nikolaus
    const randomCategory = faker.commerce.department();
    const randomPrice = parseFloat(faker.commerce.price());
    const randomUserId = faker.helpers.arrayElement(userId);
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
    const shippingInfo = {
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
    //   discountExpire: randomDiscountExpire,
    //   images,
    //   description: randomDescription,
    //   stock: randomStock,
    //   ratingsAverage: randomRating,
    //   ratingsQuantity: randomRatingQuantity,
    //   active: true,
    //   slug,
    //   reserved: 0,
    //   sold: 0,
    //   sku,
    //   attributes,
    //   shippingInfo,
    //   userId,
    // });
    const reqs = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/auth/products"),
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
          discountExpire: randomDiscountExpire,
          images,
          description: randomDescription,
          stock: randomStock,
          ratingsAverage: randomRating,
          ratingsQuantity: randomRatingQuantity,
          active: true,
          slug,
          reserved: 0,
          sold: 0,
          sku,
          attributes,
          shippingInfo,
          userId: randomUserId["_id"],
        }),
      }
    );
    reqs.slug = products[i].slug;
    reqs.user = randomUserId;
    req.push(productController.updateProduct(reqs));
  }
  await Promise.all(req);
};
export const createRandomReviews = async (productId: any[], userId: any[]) => {
  // {
  //   [
  //     {
  //       userId: "60f1b0b3b3b3b3b3b3b3b3b3",
  //       productId: "60f1b0b3b3b3b3b3b3b3b3b3",
  //       rating: 4.5,
  //       comment: "This is a great product",
  //     },
  //   ];
  // }
  const req = [];
  for (let i = 0; i < productId.length; i++) {
    for (let j = 0; j < userId.length; j++) {
      const randomRating = faker.number.float({ min: 1, max: 5 });
      const randomReviewText = faker.lorem.sentence({ min: 5, max: 10 });
      const reqs = new NextRequest(
        new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/review"),
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
      reqs.id = productId[i]["_id"];
      reqs.user = userId[j];
      req.push(reviewController.createReview(reqs));
    }
  }
  await Promise.all(req);
};

/* street: string;
  city: string;
  state: string;
  postalCode: number;
  phone: string;
  country: string;
  user: IUser["_id"];*/

export const createRandomAddresses = async (count: number, userId: any[]) => {
  const req = [];

  for (let i = 0; i < userId.length; i++) {
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
      const randomUser = userId[i];

      const reqs = new NextRequest(
        new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/address"),
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
            postalCode: randomPostalCode,
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
      //   postalCode: randomPostalCode,
      //   phone: randomPhone,
      //   country: randomCountry,
      //   user: randomUser,
      // });
    }
  }
  await Promise.all(req);
};

export const createRandomOrders = (
  count: number,
  productId: any[],
  userId: any[]
) => {
  const orders = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomStreet = faker.location.street();
      const randomCity = faker.location.city();
      const randomState = faker.location.state();
      // const randomPostalCode = faker.location.zipCode();
      const randomPostalCode = faker.helpers.fromRegExp("[0-9]{9}");
      // const randomPhone = faker.phone.number();
      // /\+380\d{9}/
      const randomPhone = faker.helpers.fromRegExp("+380[0-9]{9}");
      const randomCountry = faker.location.country();
      const randomUser = userId[i]["_id"];
      const randomItems = [] as any[];
      for (let k = 0; k < faker.number.int({ min: 1, max: 5 }); k++) {
        const randomProduct = faker.helpers.arrayElement(productId);
        const randomQuantity = faker.number.int({ min: 1, max: 5 });
        const randomPrice = randomProduct.price;
        const randomDiscount = randomProduct.discount;
        const randomFinalPrice = randomPrice - randomDiscount;
        const randomDiscountExpire = randomProduct.discountExpire;
        randomItems.push({
          _id: randomProduct._id,
          name: randomProduct.name,
          quantity: randomQuantity,
          price: randomPrice,
          discount: randomDiscount,
          finalPrice: randomFinalPrice,
          discountExpire: randomDiscountExpire,
        });
      }
      // const randomStatus = faker.random.arrayElement([
      //   "pending",
      //   "completed",
      //   "refunded",
      //   "processing",
      //   "cancelled",
      // ]);
      const randomInvoiceId = faker.helpers.fromRegExp("[0-9]{9}");
      const randomInvoiceLink = faker.internet.url();
      const randomStatus = faker.helpers.arrayElement(
        Object.values(OrderStatus)
      );

      const randomTotalPrice = randomItems.reduce((acc: number, item: any) => {
        return acc + item.finalPrice;
      }, 0);
      orders.push({
        userId: randomUser,
        shippingInfo: {
          street: randomStreet,
          city: randomCity,
          state: randomState,
          postalCode: randomPostalCode,
          phone: randomPhone,
          country: randomCountry,
        },
        items: randomItems,
        status: randomStatus,
        invoiceId: randomInvoiceId,
        invoiceLink: randomInvoiceLink,
        totalPrice: randomTotalPrice,
      });
    }
  }
  return orders;
};
/* user: IUser["_id"];
  product: IProductSchema["_id"];
  status: "pending" | "reviewing" | "completed";
  name: string;
  issue: string;
  message: string;*/
export const createRandomReport = async (
  count: number,
  productId: any[],
  userId: any[]
) => {
  const req = [];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomProduct = faker.helpers.arrayElement(productId);
      const randomUser = faker.helpers.arrayElement(userId);
      const randomStatus = faker.helpers.arrayElement([
        "pending",
        "resolved",
        "rejected",
      ]);
      const randomName = faker.lorem.words();
      const randomIssue = faker.lorem.sentence();
      const randomMessage = faker.lorem.paragraph();
      const reqs = new NextRequest(
        new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/report"),
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
            status: randomStatus,
            name: randomName,
            issue: randomIssue,
            message: randomMessage,
          }),
        }
      );
      reqs.user = randomUser;
      reqs.id = randomProduct;
      req.push(reqs); /// not working
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
  if (req.length > 0) {
    await Promise.all(req);
  }
};

export const createRandomRefund = (count: number, userId: any[]) => {
  const refunds = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i]["_id"];
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
        user: randomUser,
        status: randomStatus,
        issue: randomIssue,
        reason: randomReason,
        amount: randomAmount,
        invoiceId: randomInvoiceId,
      });
    }
  }
  return refunds;
};

export const createRandomCartItems = async (
  count: number,
  userId: any[],
  productId: any[]
) => {
  const req = [];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i];
      // const randomProduct = faker.helpers.arrayElement(productId);
      const randomProduct = productId[j];
      const randomQuantity = faker.number.int({ min: 1, max: 5 });
      const reqs = new NextRequest(
        new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/cart"),
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
      reqs.id = randomProduct["_id"];
      req.push(cartController.addToCart(reqs));
      // cartItems.push({
      //   userId: randomUser,
      //   productId: randomProduct["_id"],
      //   quantity: randomQuantity,
      // });
    }
  }
  await Promise.all(req);
};
export const createRandomWishlistItems = async (
  count: number,
  userId: any[],
  productId: any[]
) => {
  const req = [];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i];
      const randomProduct = productId[j];
      // const randomProduct = faker.helpers.arrayElement(productId);
      const reqs = new NextRequest(
        new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/wishlist"),
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
            productId: randomProduct["_id"],
          }),
        }
      );
      reqs.user = randomUser;
      reqs.id = randomProduct["_id"];
      req.push(wishlistController.toggleWishlist(reqs));
    }
  }
  await Promise.all(req);
};
export const createRandomMessages = (count: number, userId: any[]) => {
  const messages = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i]["_id"];
      const randomMessage = faker.lorem.paragraph();
      messages.push({
        user: randomUser,
        message: randomMessage,
      });
    }
  }
  return messages;
};
export const createRandomNotifications = (count: number, userId: any[]) => {
  const notifications = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i]["_id"];
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
  userId: any[],
  shippingInfo: any[]
) => {
  const req = [];
  for (let i = 0; i < userId.length; i++) {
    const findRelatedAddress = shippingInfo.filter(
      (item) => String(item.userId) === String(userId[i]["_id"])
    );
    const randomShippingInfo = faker.helpers.arrayElement(findRelatedAddress);
    const randomUser = userId[i];
    const reqs = new NextRequest(
      new URL(process.env.NEXT_PUBLIC_API_ENDPOINT + "/stripe"),
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": faker.internet.userAgent(),
          "x-client-ip": faker.internet.ipv4(),
          "x-forwarded-for": faker.internet.ipv4(),
        },
        method: "POST",
        body: JSON.stringify({ shippingInfo: randomShippingInfo }),
      }
    );
    reqs.user = randomUser;
    req.push(stripeController.createStripeSession(reqs));
  }
  const results = [];

  // return await Promise.all(req);
  const responses = await Promise.all(req);
  responses.forEach(async (res) => {
    const response = await res.json();
    // console.log(`Response ${index + 1}:`, response);
    try {
      // 2. Automate checkout
      const success = await automateStripeCheckout(response.url);

      results.push({
        userId,
        sessionId: response.sessionId,
        success,
        timestamp: new Date().toISOString(),
      });

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error(`Failed for user ${userId}:`, error);
      results.push({
        userId,
        success: false,
        error: error.message,
      });
    }
  });
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
//   shippingInfo: any[]
// ) => {
//   const results = [];

//   for (const userId of userIds) {
//     try {
//       // 1. Create session
//       const sessionResponse = await stripeController.createStripeSession({
//         user: { _id: userId },
//         body: { shippingInfo: shippingInfo[0] },
//       });

//       const { sessionId, url } = await sessionResponse.json();

//       // 2. Automate checkout
//       const success = await automateStripeCheckout(url);

//       results.push({
//         userId,
//         sessionId,
//         success,
//         timestamp: new Date().toISOString(),
//       });

//       // Rate limiting
//       await new Promise((resolve) => setTimeout(resolve, 2000));
//     } catch (error: any) {
//       console.error(`Failed for user ${userId}:`, error);
//       results.push({
//         userId,
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
