// Wishlist.controller.ts

import { type NextRequest, NextResponse } from "next/server";
import { WishlistService } from "../services/wishlist.service";
import { WishlistValidation } from "../dtos/wishlist.dto";
import AppError from "@/app/lib/utilities/appError";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { lang } from "@/app/lib/utilities/lang";

class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService = new WishlistService()
  ) {}
  async toggleWishlist(req: NextRequest) {
    try {
      if (!req.user)
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);

      const check = WishlistValidation.validateCreateWishlist({
        productId: req.id,
        userId: req.user._id,
      });
      const result = await this.wishlistService.toggleWishlist(
        check.userId.toString(),
        check.productId.toString()
      );

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      throw error;
    }
  }

  async getMyWishlists(req: NextRequest) {
    try {
      const userId = String(req.user?._id);

      const result = await this.wishlistService.getUserWishlists(userId, {
        query: req.nextUrl.searchParams,

        populate: true,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      throw error;
    }
  }

  async checkWishlist(req: NextRequest) {
    try {
      if (!req.user)
        throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);

      const check = WishlistValidation.validateCreateWishlist({
        productId: req.id,
        userId: req.user._id,
      });
      const isWishlist = await this.wishlistService.checkWishlist(
        check.userId.toString(),
        check.productId.toString()
      );

      return NextResponse.json({ isWishlist }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
}

export default new WishlistController();
