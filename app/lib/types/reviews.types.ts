import { ProductType } from "./products.types";
import { UserAuthType } from "./users.types";

export type ReviewsType = {
  _id: string;
  userId: Partial<UserAuthType>;
  productId: Partial<ProductType>;
  rating: number;
  comment: string;
  createdAt: string;
};
