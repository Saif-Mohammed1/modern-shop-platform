import { ProductType } from "./products.types";
import { UserAuthType } from "./users.types";

export type UserInCart = Partial<UserAuthType> | undefined;

export type CartItemsType = {
  quantity: number;
  _id: ProductType["_id"];
  name: ProductType["name"];
  price: ProductType["price"];
  images: ProductType["images"];
  stock: ProductType["stock"];
  slug: ProductType["slug"];
  category: ProductType["category"];
  expiresAt: Date;
  discountExpire?: ProductType["discountExpire"];
  discount: ProductType["discount"];
}; //& ProductType;

export type CartContextType = {
  isCartOpen: boolean;
  toggleCartStatus: () => void;
  cartItems: CartItemsType[];
  addToCartItems: (product: ProductType, quantity?: number) => void;
  removeCartItem: (product: ProductType) => void;
  setIsCartOpen: (status: boolean) => void;
  clearProductFromCartItem: (product: ProductType) => void;
};
