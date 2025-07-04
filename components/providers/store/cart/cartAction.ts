import type {
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.db.types";
import api_client from "@/app/lib/utilities/api.client";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { useCartStore } from "./cart.store";

// Add item to cart

export async function saveCartToDB(product_id: string, quantity: number) {
  await api_client.post(`/customers/cart/${product_id}`, {
    quantity,
  });

  // return data.data;
}

export async function removeCartItemFromDB(product: ProductCartPick) {
  await api_client.put(`/customers/cart/${product._id}`);
}
export async function clearCartInDB(product: ProductCartPick) {
  await api_client.delete(`/customers/cart/${product._id}`);
}
export const mergeLocalCartWithDB = async () => {
  try {
    const StoredCart = useCartStore.getState().cartItems;
    if (!StoredCart) {
      return;
    }

    if (!Array.isArray(StoredCart) || StoredCart.length === 0) {
      useCartStore.setState({
        cartItems: [],
      });
      return;
    }
    await api_client.post(
      "/customers/cart/merge",

      { products: StoredCart }
    );
    // Clear local cart after merging
    useCartStore.setState({
      cartItems: [],
    });
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
  } = await api_client.get("/customers/cart");

  return data.products || [];
};
// export const updateCartQuantity = async (
//   product_id: string,
//   quantity: number
// ) => {
//
//     const { data } = await api_client.patch(`/customers/cart/${product_id}`, {
//       quantity,
//     });
//     return data.data;
//   } catch (error) {
//     throw error;
//   }
// };
