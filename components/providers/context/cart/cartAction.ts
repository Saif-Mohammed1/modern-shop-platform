import { ProductType } from "@/app/lib/types/products.types";
import AppError from "@/app/lib/utilities/appError";
import api from "@/app/lib/utilities/api";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";
import { lang } from "@/app/lib/utilities/lang";
import { UserAuthType } from "@/app/lib/types/users.types";
import { CartItemsType } from "@/app/lib/types/cart.types";
type User = UserAuthType | null;
// Add item to cart
export const addToCart = async (
  product: ProductType,
  user: User,
  quantity: number = 1
) => {
  try {
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
  } catch (error) {
    throw error;
  }
};

// Remove item from cart
export const removeFromCart = async (
  product: ProductType,
  user: User,
  quantity: number = 1
) => {
  let cart: CartItemsType[];
  try {
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
  } catch (error) {
    throw error;
  }
};

// Clear cart
export const clearItemFromCart = async (product: ProductType, user: User) => {
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
  try {
    const { data } = await api.post("/customer/cart/" + productId, {
      quantity,
    });

    return data.data;
  } catch (error) {
    throw error;
  }
};

// Get cart items (either from DB or localStorage)
export const getCartItems = async (user: User) => {
  try {
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
  } catch (error) {
    throw error;
  }
};
export const removeCartItemFromDB = async (product: ProductType) => {
  try {
    await api.put(`/customer/cart/${product._id}`);
  } catch (error) {
    throw error;
  }
};
export const clearCartInDB = async (product: ProductType) => {
  try {
    await api.delete(`/customer/cart/${product._id}`);
  } catch (error) {
    throw error;
  }
};
export const mergeLocalCartWithDB = async () => {
  try {
    const StoredCart = localStorage.getItem("cart");

    const localCart: CartItemsType[] = StoredCart ? JSON.parse(StoredCart) : [];

    if (localCart.length === 0) return;
    await api.post(
      "/customer/cart/merge",

      localCart
    );
    localStorage.removeItem("cart");
  } catch (error) {
    throw error;
  }
};
const fetchCartItemsFromDB = async () => {
  try {
    const { data } = await api.get("/customer/cart");

    return data.data;
  } catch (error) {
    throw error;
  }
};
export const updateCartQuantity = async (
  productId: string,
  quantity: number
) => {
  try {
    const { data } = await api.patch(`/customer/cart/${productId}`, {
      quantity,
    });
    return data.data;
  } catch (error) {
    throw error;
  }
};
