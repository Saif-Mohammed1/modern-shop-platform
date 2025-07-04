import type {
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.types";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { useCartStore } from "./cart.store";

// Add item to cart

export async function saveCartToDB(productId: string, quantity: number) {
  await api.post(`/customers/cart/${productId}`, {
    quantity,
  });

  // return data.data;
}

export async function removeCartItemFromDB(product: ProductCartPick) {
  await api.put(`/customers/cart/${product._id}`);
}
export async function clearCartInDB(product: ProductCartPick) {
  await api.delete(`/customers/cart/${product._id}`);
}
export const mergeLocalCartWithDB = async () => {
  try {
    const StoredCart = useCartStore.getState().cartItems;
    if (!StoredCart) {
      return;
    }

    if (!Array.isArray(StoredCart) || StoredCart.length === 0) {
      useCartStore.setState({ cartItems: [] });
      return;
    }
    await api.post(
      "/customers/cart/merge",

      { products: StoredCart }
    );
    useCartStore.setState({ cartItems: [] });
    return {
      message: cartContextTranslate[lang].cartContext.mergeLocalCart.success,
    };
  } catch (error) {
    return {
      message:
        (error as Error).message ||
        cartContextTranslate[lang].cartContext.mergeLocalCart.error,
    };
  }
};
export const fetchCartItemsFromDB = async () => {
  const {
    data,
  }: {
    data: {
      products: CartItemsType[];
    };
  } = await api.get("/customers/cart");

  return data.products || [];
};
// export const updateCartQuantity = async (
//   productId: string,
//   quantity: number
// ) => {
//
//     const { data } = await api.patch(`/customers/cart/${productId}`, {
//       quantity,
//     });
//     return data.data;
//   } catch (error) {
//     throw error;
//   }
// };
