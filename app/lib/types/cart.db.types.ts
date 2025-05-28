export interface ICartItemDB {
  _id: string;
  user_id: string;
  quantity: number;
  product_id: string;
  created_at: Date;
  updated_at: Date;
}
import type { ProductType } from "./products.types";
import type { UserAuthType } from "./users.db.types";

export type UserInCart = Partial<UserAuthType> | undefined;
// Alias the picked fields from ProductType
export type ProductCartPick = Pick<
  ProductType,
  | "_id"
  | "name"
  | "price"
  | "images"
  | "stock"
  | "slug"
  | "category"
  | "discount"
  | "discount_expire"
>;

export type CartItemsType = {
  quantity: number;
} & ProductCartPick;

export type CartContextType = {
  isCartOpen: boolean;
  toggleCartStatus: () => void;
  cartItems: CartItemsType[];
  addToCartItems: (
    product: ProductCartPick,
    quantity?: number
  ) => Promise<void>;
  removeCartItem: (product: ProductCartPick) => Promise<void>;
  setIsCartOpen: (status: boolean) => void;
  clearProductFromCartItem: (product: ProductCartPick) => Promise<void>;
};
