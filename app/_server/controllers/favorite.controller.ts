// favorite.controller.ts

import { NextRequest, NextResponse } from "next/server";
import { FavoriteService } from "../services/favorite.service";
import { FavoriteValidation } from "../dtos/favorite.dto";

class FavoriteController {
  private readonly favoriteService = new FavoriteService();

  async addFavorite(req: NextRequest) {
    try {
      const result = FavoriteValidation.validateCreateFavorite({
        productId: req.id,
        userId: req.user?._id,
      });
      const favorite = await this.favoriteService.create(result);

      return NextResponse.json(favorite, { status: 201 });
    } catch (error) {
      throw error;
    }
  }

  async removeFavorite(req: NextRequest) {
    try {
      const result = FavoriteValidation.validateCreateFavorite({
        productId: req.id,
        userId: req.user?._id,
      });
      await this.favoriteService.delete(
        String(result.productId),
        String(result.userId)
      );

      return NextResponse.json(
        { message: "Favorite removed successfully" },
        { status: 200 }
      );
    } catch (error) {
      throw error;
    }
  }

  async getFavorites(req: NextRequest) {
    try {
      const userId = String(req.user?._id);

      const result = await this.favoriteService.getUserFavorites(userId, {
        query: req.nextUrl.searchParams,

        populate: true,
      });

      return NextResponse.json(result, { status: 200 });
    } catch (error) {
      throw error;
    }
  }

  async checkFavorite(req: NextRequest) {
    try {
      const productId = req.id;
      const userId = String(req.user?._id);

      const isFavorite = await this.favoriteService.checkFavorite(
        productId,
        userId
      );

      return NextResponse.json({ isFavorite }, { status: 200 });
    } catch (error) {
      throw error;
    }
  }
}

export default new FavoriteController();
