// Wishlist.controller.ts
import { type NextRequest, NextResponse } from "next/server";

import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

import { WishlistValidation } from "../dtos/wishlist.dto";
import { WishlistService } from "../services/wishlist.service";

class WishlistController {
  constructor(
    private readonly wishlistService: WishlistService = new WishlistService()
  ) {}
  async toggleWishlist(req: NextRequest) {
    if (!req.user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }

    const check = WishlistValidation.validateCreateWishlist({
      productId: req.id,
      userId: req.user._id,
    });
    const result = await this.wishlistService.toggleWishlist(
      check.userId.toString(),
      check.productId.toString()
    );

    return NextResponse.json(result, { status: 200 });
  }

  async getMyWishlists(req: NextRequest) {
    const userId = String(req.user?._id);

    const result = await this.wishlistService.getUserWishlists(userId);
    // const result = await this.wishlistService.getUserWishlists(userId, {
    //   query: req.nextUrl.searchParams,

    //   populate: true,
    // });
    return NextResponse.json(result, { status: 200 });
  }

  async checkWishlist(req: NextRequest) {
    if (!req.user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }

    const check = WishlistValidation.validateCreateWishlist({
      productId: req.id,
      userId: req.user._id,
    });
    const isWishlist = await this.wishlistService.checkWishlist(
      check.userId.toString(),
      check.productId.toString()
    );

    return NextResponse.json({ isWishlist }, { status: 200 });
  }
}

export default new WishlistController();
