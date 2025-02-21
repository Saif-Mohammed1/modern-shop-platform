import { OrderStatus } from "@/app/lib/types/orders.types";
import { faker } from "@faker-js/faker";
import { assignAsObjectId } from "./assignAsObjectId";
// create a random user
interface IUserInput {
  name: string;
  email: string;
  password: string;
  //   passwordConfirm: string | undefined;
  emailVerify: boolean;
}

export const createRandomUsers = (count: number) => {
  const users = [] as IUserInput[];
  for (let i = 0; i < count; i++) {
    const randomName = faker.person.fullName(); // Rowan Nikolaus
    const randomEmail = faker.internet.email(); //
    const randomPassword = "Pa@password12345";
    const emailVerify = faker.datatype.boolean();

    users.push({
      name: randomName,
      email: randomEmail,
      password: randomPassword,
      emailVerify: emailVerify,
    });
  }
  return users;
}; // create a random product
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
export const createRandomProducts = (count: number, userId: string) => {
  const products = [] as IProductInput[];
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
    products.push({
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
      userId,
    });
  }
  return products;
};
export const createRandomReviews = (productId: any[], userId: any[]) => {
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
  const reviews = [] as any[];
  for (let i = 0; i < productId.length; i++) {
    for (let j = 0; j < userId.length; j++) {
      const randomRating = faker.number.float({ min: 1, max: 5 });
      const randomReviewText = faker.lorem.sentence({ min: 5, max: 10 });
      reviews.push({
        userId: userId[j]["_id"],
        productId: productId[i]["_id"],
        rating: randomRating,
        comment: randomReviewText,
      });
    }
  }

  return reviews;
};

/* street: string;
  city: string;
  state: string;
  postalCode: number;
  phone: string;
  country: string;
  user: IUser["_id"];*/

export const createRandomAddresses = (count: number, userId: any[]) => {
  const addresses = [] as any[];

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

      addresses.push({
        street: randomStreet,
        city: randomCity,
        state: randomState,
        postalCode: randomPostalCode,
        phone: randomPhone,
        country: randomCountry,
        user: randomUser,
      });
    }
  }
  return addresses;
};
/*// import Address from "./address.model";
type status = "pending" | "completed" | "refunded" | "processing" | "cancelled";
interface IShippingInfo {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  country: string;
}
interface IItems {
  _id: IProductSchema["_id"];
  name: string;
  quantity: number;
  price: number;
  discount: number;
  finalPrice: number;
  discountExpire: Date;
}
export interface IOrderSchema extends Document {
  _id: Schema.Types.ObjectId;
  user: IUser["_id"];
  shippingInfo: IShippingInfo;
  items: IItems[];
  status: status;
  invoiceId: string;
  invoiceLink: string;
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}*/
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
        user: randomUser,
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
/*const RefundSchema = new Schema<IRefundSchema>(
  {
    user: {
      type: Schema.Types.ObjectId,

      ref: "User",
      required: true,  index: true,
    },
    status: {
      type: String,
      // required: true,
      enum: ["pending", "processing", "accepted", "refused"],
      default: "pending",
    },
    issue: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    invoiceId: {
      type: String,
      required: true,
    },
  },*/
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
