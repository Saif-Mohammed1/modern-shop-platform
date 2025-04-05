import type {
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.types";
import type { UserAuthType } from "@/app/lib/types/users.types";
import api from "@/app/lib/utilities/api";
import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

type User = UserAuthType | null;
// Add item to cart
export const addToCart = async (
  product: ProductCartPick,
  user: User,
  quantity: number = 1
) => {
  if (user) {
    // User is signed in, store cart in DB
    const data = await saveCartToDB(product._id, quantity);

    return data;
  } else {
    // User is not signed in, store cart in localStorage
    const StoredCart = localStorage.getItem("cart");

    const cart: CartItemsType[] = StoredCart ? JSON.parse(StoredCart) : [];
    const existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      if (quantity > 1 && quantity > product.stock) {
        throw new AppError(
          cartContextTranslate[lang].functions.addToCart.outOfStock,
          400
        );
      }
      if (
        quantity == 1 &&
        existingProduct.quantity + quantity > product.stock
      ) {
        throw new AppError(
          cartContextTranslate[lang].functions.addToCart.outOfStock,
          400
        );
      }

      // existingProduct.quantity += quantity;
    }
    cart.push({
      ...product,
      quantity,
      // user: product.user._id as string,
    });

    localStorage.setItem("cart", JSON.stringify(cart));

    return cart;
  }
};

// Remove item from cart
export const removeFromCart = async (
  product: ProductCartPick,
  user: User,
  quantity: number = 1
) => {
  let cart: CartItemsType[];

  if (user) {
    // User is signed in, remove cart item from DB
    await removeCartItemFromDB(product);
    const data = await getCartItems(user);
    return data;
  } else {
    // User is not signed in, remove cart item from localStorage
    const StoredCart = localStorage.getItem("cart");

    cart = StoredCart ? JSON.parse(StoredCart) : [];
    const existingProduct = cart.find((item) => item._id === product._id);

    if (existingProduct) {
      if (existingProduct.quantity > 1) {
        existingProduct.quantity -= quantity;
      } else {
        cart = cart.filter((item) => item._id !== product._id);
      }
      localStorage.setItem("cart", JSON.stringify(cart));
    }
    return cart;
  }
};

// Clear cart
export const clearItemFromCart = async (
  product: ProductCartPick,
  user: User
) => {
  if (user) {
    // User is signed in, clear cart in DB
    await clearCartInDB(product);
    const data = await getCartItems(user);
    return data;
  } else {
    // User is not signed in, remove cart item from localStorage
    const StoredCart = localStorage.getItem("cart");

    let cart: CartItemsType[] = StoredCart ? JSON.parse(StoredCart) : [];
    cart = cart.filter((item) => item._id !== product._id);

    localStorage.setItem("cart", JSON.stringify(cart));

    return cart;
  }
};
export const saveCartToDB = async (productId: string, quantity: number) => {
  await api.post("/customers/cart/" + productId, {
    quantity,
  });

  // return data.data;
};

// Get cart items (either from DB or localStorage)
export const getCartItems = async (user: User) => {
  if (user) {
    // Fetch cart items from the database
    const data = await fetchCartItemsFromDB();
    return data;
  } else {
    // Fetch cart items from localStorage
    const StoredCart = localStorage.getItem("cart");

    const cart: CartItemsType[] = StoredCart ? JSON.parse(StoredCart) : [];
    return cart;
  }
};
export const removeCartItemFromDB = async (product: ProductCartPick) => {
  await api.put(`/customers/cart/${product._id}`);
};
export const clearCartInDB = async (product: ProductCartPick) => {
  await api.delete(`/customers/cart/${product._id}`);
};
export const mergeLocalCartWithDB = async () => {
  try {
    const StoredCart = localStorage.getItem("cart");
    if (!StoredCart) return;

    const localCart: CartItemsType[] = JSON.parse(StoredCart);
    if (!Array.isArray(localCart) || localCart.length === 0) {
      localStorage.removeItem("cart");
      return;
    }
    await api.post(
      "/customers/cart/merge",

      { products: localCart }
    );
    localStorage.removeItem("cart");
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
const fetchCartItemsFromDB = async () => {
  const { data } = await api.get("/customers/cart");

  return data.products;
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
