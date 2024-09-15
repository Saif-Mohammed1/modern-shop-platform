import AppError from "../util/appError";
import api from "../util/axios.api";

// Add item to cart
export const addToCart = async (product, userId = null, quantity = 1) => {
  try {
    if (userId) {
      // User is signed in, store cart in DB
      const data = await saveCartToDB(product._id);

      return data;
    } else {
      // User is not signed in, store cart in localStorage
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      const existingProduct = cart.find((item) => item._id === product._id);

      if (existingProduct) {
        if (existingProduct.quantity + 1 > product.stock) {
          throw new AppError("Product out of stock", 400);
        }

        existingProduct.quantity += 1;
      } else {
        cart.push({ ...product, quantity });
      }
      localStorage.setItem("cart", JSON.stringify(cart));

      return cart;
    }
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

// Remove item from cart
export const removeFromCart = async (product, userId = null, quantity = 1) => {
  let cart;
  try {
    if (userId) {
      // User is signed in, remove cart item from DB
      await removeCartItemFromDB(product);
      const data = await getCartItems(userId);
      return data;
    } else {
      // User is not signed in, remove cart item from localStorage
      cart = JSON.parse(localStorage.getItem("cart")) || [];

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
    throw new AppError(error.message, error.status);
  }
};

// Clear cart
export const clearItemFromCart = async (product, userId = null) => {
  if (userId) {
    // User is signed in, clear cart in DB
    await clearCartInDB(product);
    return;
  } else {
    // User is not signed in, remove cart item from localStorage
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart = cart.filter((item) => item._id !== product._id);

    localStorage.setItem("cart", JSON.stringify(cart));

    return cart;
  }
};
export const saveCartToDB = async (productId) => {
  try {
    const { data } = await api.post("/customer/cart/" + productId);

    return data.data;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};

// Get cart items (either from DB or localStorage)
export const getCartItems = async (userId = null) => {
  try {
    if (userId) {
      // Fetch cart items from the database
      const data = await fetchCartItemsFromDB();
      return data;
    } else {
      // Fetch cart items from localStorage
      return JSON.parse(localStorage.getItem("cart")) || [];
    }
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};
export const removeCartItemFromDB = async (product) => {
  try {
    await api.put(`/customer/cart/${product._id}`);
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};
export const clearCartInDB = async (product) => {
  try {
    await api.delete(`/customer/cart/${product._id}`);
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};
export const mergeLocalCartWithDB = async () => {
  try {
    const localCart = JSON.parse(localStorage.getItem("cart")) || [];

    if (localCart.length === 0) return;
    await api.post(
      "/customer/cart/merge",

      localCart
    );
    localStorage.removeItem("cart");
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};
const fetchCartItemsFromDB = async () => {
  try {
    const { data } = await api.get("/customer/cart");

    return data.data;
  } catch (error) {
    throw new AppError(error.message, error.status);
  }
};
