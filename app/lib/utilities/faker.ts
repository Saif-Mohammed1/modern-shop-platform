import { OrderStatus } from "@/app/lib/types/orders.types";
import { faker } from "@faker-js/faker";
import { assignAsObjectId } from "./assignAsObjectId";
import { NextRequest } from "next/server";
import productController from "@/app/_server/controllers/product.controller";
import { IUser } from "@/app/_server/models/User.model";
import authController from "@/app/_server/controllers/auth.controller";
import addressController from "@/app/_server/controllers/address.controller";
import reviewController from "@/app/_server/controllers/review.controller";
// create a random user
interface IUserInput {
  name: string;
  email: string;
  password: string;
  //   passwordConfirm: string | undefined;
  emailVerify: boolean;
}

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
interface IProductInput {
  name: string;
  category: string;
  price: number;
  discount?: number;
  discountExpire?: Date;
  images: { link: string; public_id: string }[];
  userId: string | null;
  description: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
  active: boolean;
  slug: string;
  reserved: number;
  lastReserved?: Date;
  sold: number;

  sku: string;
  attributes: Record<string, any>;
  shippingInfo: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
  };

  //   createdAt: Date;
}
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
export const createRandomReport = (
  count: number,
  productId: any[],
  userId: any[]
) => {
  const reports = [] as any[];
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
      reports.push({
        user: randomUser["_id"],
        product: randomProduct["_id"],
        status: randomStatus,
        name: randomName,
        issue: randomIssue,
        message: randomMessage,
      });
    }
  }
  return reports;
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

export const createRandomCartItems = (
  count: number,
  userId: any[],
  productId: any[]
) => {
  const cartItems = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i]["_id"];
      // const randomProduct = faker.helpers.arrayElement(productId);
      const randomProduct = productId[j];
      const randomQuantity = faker.number.int({ min: 1, max: 5 });
      cartItems.push({
        userId: randomUser,
        productId: randomProduct["_id"],
        quantity: randomQuantity,
      });
    }
  }
  return cartItems;
};
export const createRandomWishlistItems = (
  count: number,
  userId: any[],
  productId: any[]
) => {
  const wishlistItems = [] as any[];
  for (let i = 0; i < userId.length; i++) {
    for (let j = 0; j < count; j++) {
      const randomUser = userId[i]["_id"];
      const randomProduct = faker.helpers.arrayElement(productId);
      wishlistItems.push({
        userId: randomUser,
        productId: randomProduct["_id"],
      });
    }
  }
  return wishlistItems;
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
