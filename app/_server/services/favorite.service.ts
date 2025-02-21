import AppError from "@/app/lib/utilities/appError";

import { FavoriteRepository } from "../repositories/favorite.repository";
import FavoriteModel from "../models/Favorite.model";
import { CreateFavoriteDTO } from "../dtos/favorite.dto";
import { FavoriteQueryConfig } from "@/app/lib/types/favorite.types";

export class FavoriteService {
  private repository = new FavoriteRepository(FavoriteModel);
  async create(dto: CreateFavoriteDTO) {
    this.repository.create(dto);
  }
  async getUserFavorites(userId: string, options: FavoriteQueryConfig) {
    return this.repository.getUserFavorites(userId, options);
  }
  async delete(productId: string, userId: string) {
    const isDeleted = await this.repository.deleteFavorite(productId, userId);
    if (!isDeleted) throw new AppError("Favorite not found", 404);
  }
  async checkFavorite(productId: string, userId: string) {
    return this.repository.isFavorite(productId, userId);
  }
}
