import { ProductType } from "./products.types";
import { UserAuthType } from "./users.types";

export type ReviewsType = {
  _id: string;
  user: Partial<UserAuthType>;
  product: Partial<ProductType>;
  rating: number;
  reviewText: string;
  createdAt: string;
};
