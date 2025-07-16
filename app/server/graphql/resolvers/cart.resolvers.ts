import { lang } from "@/app/lib/utilities/lang";
import { CartTranslate } from "@/public/locales/server/Cart.Translate";

import { CartValidation } from "../../dtos/cart.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { CartService } from "../../services/cart.service";
import type { Context } from "../apollo-server";
const cartService = new CartService();
export const cartResolvers = {
  Query: {
    getMyCart: async (_parent: unknown, _args: unknown, { req }: Context) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const cart = await cartService.getMyCart(user_id);
      return { products: cart };
    },
  },
  Mutation: {
    addToCart: async (
      _parent: unknown,
      { product_id, quantity }: { product_id: string; quantity: number },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const result = CartValidation.isCartValid({
        product_id,
        quantity,
      });
      await cartService.addToCart(user_id, result.product_id, result.quantity);
      return { message: CartTranslate[lang].messages.addToCart };
    },
    decreaseQuantity: async (
      _parent: unknown,
      { product_id }: { product_id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const productId = CartValidation.isValidProductId(product_id);
      await cartService.decreaseQuantity(user_id, productId.toString());
      return { message: CartTranslate[lang].messages.decreaseQuantity };
    },
    removeProductFromCart: async (
      _parent: unknown,
      { product_id }: { product_id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const productId = CartValidation.isValidProductId(product_id);
      await cartService.removeProductFromCart(user_id, productId.toString());
      return { message: CartTranslate[lang].messages.removeFromCart };
    },
    clearCart: async (_parent: unknown, _args: unknown, { req }: Context) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      await cartService.clearCart(user_id);
      return { message: CartTranslate[lang].messages.clearCart };
    },
    saveLocalCartToDB: async (
      _parent: unknown,
      { localCart }: { localCart: { product_id: string; quantity: number }[] },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);
      const result = CartValidation.validateLocalCart(localCart);
      await cartService.saveLocalCartToDB(user_id, result);
      return { message: CartTranslate[lang].messages.mergeLocalCart };
    },
  },
};
