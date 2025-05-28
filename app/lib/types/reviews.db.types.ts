// import type { ProductType } from "./products.types";
// import type { UserAuthType } from "./users.db.types";

export type ReviewsType = {
  _id: string;
  user_name: string;
  product_id: {
    name: string;
    slug: string;
  }[];
  rating: number;
  comment: string;
  created_at: string;
};
