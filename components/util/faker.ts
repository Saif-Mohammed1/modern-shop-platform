import { faker } from "@faker-js/faker";
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
    const randomPassword = "password12345";
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
  user: string | null;
  description: string;
  stock: number;
  ratingsAverage: number;
  ratingsQuantity: number;
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
      user: userId,
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
  //       reviewText: "This is a great product",
  //     },
  //   ];
  // }
  const reviews = [] as any[];
  for (let i = 0; i < productId.length; i++) {
    for (let j = 0; j < userId.length; j++) {
      const randomRating = faker.number.float({ min: 1, max: 5 });
      const randomReviewText = faker.lorem.sentence({ min: 5, max: 10 });
      reviews.push({
        user: userId[j]["_id"],
        product: productId[i]["_id"],
        rating: randomRating,
        reviewText: randomReviewText,
      });
    }
  }

  return reviews;
};
