import { zObjectId } from "@/app/lib/utilities/assignAsObjectId";
import { z } from "zod";

export class FavoriteValidation {
  static createFavoriteSchema = z.object({
    productId: zObjectId,
    userId: zObjectId,
  });
  static validateCreateFavorite = (data: any) => {
    return this.createFavoriteSchema.parse(data);
  };
}

export type CreateFavoriteDTO = z.infer<
  typeof FavoriteValidation.createFavoriteSchema
>;
