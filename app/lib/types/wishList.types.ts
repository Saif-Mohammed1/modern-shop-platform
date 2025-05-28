import type { ProductCartPick } from "./cart.db.types";
// import type { ProductType } from "./products.types";

export interface FavoriteQueryConfig {
  query: URLSearchParams;
  // query?: Record<string, any>;
  // page?: number;
  // limit?: number;
  // sort?: string;
  populate?: boolean;
}
export type WishlistType = {
  items: ProductCartPick[];
  // items: Pick<ProductType, "_id" | "name" | "slug" | "price" | "images">[];
  // user_id: string;
  _id: string;
};
