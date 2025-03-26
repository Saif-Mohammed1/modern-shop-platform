import type { ProductType } from "./products.types";

export interface FavoriteQueryConfig {
  query: URLSearchParams;
  // query?: Record<string, any>;
  // page?: number;
  // limit?: number;
  // sort?: string;
  populate?: boolean;
}
export type WishlistType = {
  productId: ProductType;
  userId: string;
  _id?: string;
};
