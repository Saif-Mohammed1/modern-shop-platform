import { gql, useMutation } from "@apollo/client";

import type {
  CartItemsType,
  ProductCartPick,
} from "@/app/lib/types/cart.db.types";
import client from "@/app/lib/utilities/apollo-client";
import { lang } from "@/app/lib/utilities/lang";
import { cartContextTranslate } from "@/public/locales/client/(public)/cartContextTranslate";

import { GET_CART } from "../../UserSessionSync";
import { useUserStore } from "../user/user.store";

import { useCartStore } from "./cart.store";

const ADD_TO_CART = gql`
  mutation AddToCart($product_id: String!, $quantity: Int!) {
    addToCart(product_id: $product_id, quantity: $quantity) {
      message
    }
  }
`;
const DECREASE_QUANTITY = gql`
  mutation DecreaseQuantity($product_id: String!) {
    decreaseQuantity(product_id: $product_id) {
      message
    }
  }
`;
const REMOVE_PRODUCT_FROM_CART = gql`
  mutation RemoveProductFromCart($product_id: String!) {
    removeProductFromCart(product_id: $product_id) {
      message
    }
  }
`;
const SAVE_LOCAL_CART_TO_DB = gql`
  mutation SaveLocalCartToDB($localCart: [localCartDto]!) {
    saveLocalCartToDB(localCart: $localCart) {
      message
    }
  }
`;
export const useCartHook = () => {
  const [addToCart] = useMutation(ADD_TO_CART);
  const [decreaseQuantity] = useMutation(DECREASE_QUANTITY);
  const [removeProductFromCart] = useMutation(REMOVE_PRODUCT_FROM_CART);
  const [saveLocalCartToDB] = useMutation(SAVE_LOCAL_CART_TO_DB);
  const getCartItems = async () => {
    const { user } = useUserStore.getState();

    // Check if user is signed in
    if (user) {
      // Fetch cart items from the database
      const { data } = await client.query<{
        getMyCart: { products: CartItemsType[] };
      }>({
        query: GET_CART,
        fetchPolicy: "network-only",
      });
      const items = data.getMyCart.products;

      return items;
      // useCartStore.setState({ cartItems: items });
      // return;
    }
    return useCartStore.getState().cartItems || [];
  };
  const addToCartItems = async (
    product: ProductCartPick,
    quantityValue: number = 1
  ) => {
    const { user } = useUserStore.getState();

    useCartStore.setState((state) => {
      // check if the product already exists in the cart
      // if it does, update the quantity
      // if it doesn't, add the product to the cart
      // if the quantity is greater than 1, set it to that value
      const existing = state.cartItems.find((item) => item._id === product._id);
      if (existing) {
        return {
          ...state,
          cartItems: state.cartItems.map((item) =>
            item._id === product._id
              ? // ? { ...item, quantity: item.quantity + quantityValue }
                {
                  ...item,
                  quantity:
                    quantityValue > 1 ? quantityValue : item.quantity + 1,
                }
              : item
          ),
        };
      }
      // if the product doesn't exist in the cart, add it
      return {
        ...state,
        cartItems: [
          ...state.cartItems,
          { ...product, quantity: quantityValue },
        ],
      };
    });
    if (user) {
      try {
        // User is signed in, store cart in DB
        await addToCart({
          variables: {
            product_id: product._id,
            quantity: quantityValue,
          },
        });
      } catch (error) {
        // Rollback on error
        const originalCart = await getCartItems();
        useCartStore.setState({ cartItems: originalCart });
        throw error;
      }
    }
  };
  const decrementCartItemQuantity = async (product: ProductCartPick) => {
    const { user } = useUserStore.getState();
    try {
      useCartStore.setState((state) => {
        // check if product exist in cart and quantity is greater than 1 then decrease quantity by 1
        const existingProduct = state.cartItems.find(
          (item) => item._id === product._id
        );
        if (!existingProduct) {
          return state;
        }
        // If quantity is greater than 1, decrease it by 1
        if (existingProduct.quantity > 1) {
          return {
            ...state,
            cartItems: state.cartItems.map((item) =>
              item._id === product._id
                ? { ...item, quantity: item.quantity - 1 }
                : item
            ),
          };
        }
        return {
          ...state,
          cartItems: state.cartItems.filter((item) => item._id !== product._id),
        };
      });
      if (user) {
        // User is signed in, remove cart item from DB
        await decreaseQuantity({
          variables: {
            product_id: product._id,
          },
        });
      }
    } catch (error) {
      const originalCart = await getCartItems();
      useCartStore.setState({ cartItems: originalCart });
      throw error;
    }
  };
  const clearProductFromCartItem = async (product: ProductCartPick) => {
    const { user } = useUserStore.getState();
    try {
      useCartStore.setState((state) => ({
        ...state,
        cartItems: state.cartItems.filter((item) => item._id !== product._id),
      }));
      if (user) {
        // User is signed in, clear cart item from DB
        await removeProductFromCart({
          variables: {
            product_id: product._id,
          },
        });
      }
    } catch (error) {
      const originalCart = await getCartItems();
      useCartStore.setState({ cartItems: originalCart });
      throw error;
    }
  };
  const mergeLocalCartWithDB = async () => {
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
      await saveLocalCartToDB({
        variables: {
          localCart: StoredCart,
        },
      });
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
  return {
    getCartItems,
    addToCartItems,
    decrementCartItemQuantity,
    clearProductFromCartItem,
    mergeLocalCartWithDB,
  };
};
