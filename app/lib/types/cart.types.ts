import type { ProductType } from "./products.types";
import type { UserAuthType } from "./users.types";

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
  | "discountExpire"
>;

export type CartItemsType = {
  quantity: number;
  expiresAt?: Date;
  // _id: ProductType["_id"];
  // name: ProductType["name"];
  // price: ProductType["price"];
  // images: ProductType["images"];
  // stock: ProductType["stock"];
  // slug: ProductType["slug"];
  // category: ProductType["category"];
  // discountExpire?: ProductType["discountExpire"];
  // discount: ProductType["discount"];
} & ProductCartPick;

export type CartContextType = {
  isCartOpen: boolean;
  toggleCartStatus: () => void;
  cartItems: CartItemsType[];
  addToCartItems: (product: ProductCartPick, quantity?: number) => void;
  removeCartItem: (product: ProductCartPick) => void;
  setIsCartOpen: (status: boolean) => void;
  clearProductFromCartItem: (product: ProductCartPick) => void;
};
