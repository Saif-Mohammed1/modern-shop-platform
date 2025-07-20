import { WishlistValidation } from "../../dtos/wishlist.dto";
import { AuthMiddleware } from "../../middlewares/auth.middleware";
import { WishlistService } from "../../services/wishlist.service";
import { GlobalFilterValidator } from "../../validators/global-filter.validator";
import type { Context } from "../apollo-server";

const wishlistService: WishlistService = new WishlistService();
export const wishlistResolvers = {
  Query: {
    getMyWishlists: async (
      _parent: unknown,
      _args: unknown,
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);
      const user_id = String(req.user?._id);

      // Fetch user wishlists
      const result = await wishlistService.getUserWishlists(user_id);
      // const result = await this.wishlistService.getUserWishlists(user_id, {
      //   query: req.nextUrl.searchParams,

      //   populate: true,
      // });
      return result;
    },
  },
  Mutation: {
    toggleWishlist: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const user_id = String(req.user?._id);

      const check = WishlistValidation.validateCreateWishlist({
        product_id: validatedId,
        user_id,
      });
      const result = await wishlistService.toggleWishlist(
        check.user_id.toString(),
        check.product_id.toString()
      );

      return result;
    },
    checkWishlist: async (
      _parent: unknown,
      { id }: { id: string },
      { req }: Context
    ) => {
      await AuthMiddleware.requireAuth([])(req);

      // Validate ID format
      const validatedId = GlobalFilterValidator.validateId(id);

      const user_id = String(req.user?._id);
      const check = WishlistValidation.validateCreateWishlist({
        product_id: validatedId,
        user_id,
      });
      const isWishlist = await wishlistService.checkWishlist(
        check.user_id.toString(),
        check.product_id.toString()
      );

      return { isWishlist };
    },
  },
};
