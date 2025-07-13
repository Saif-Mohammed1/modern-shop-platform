// wishlist.repository.ts

import type { Knex } from "knex";

import type { IWishlistDB } from "@/app/lib/types/wishList.db.types";
import type { WishlistType } from "@/app/lib/types/wishList.types";

import { BaseRepository } from "./BaseRepository";

export class WishlistRepository extends BaseRepository<IWishlistDB> {
  constructor(knex: Knex) {
    super(knex, "wishlist");
  }

  async deleteWishlist(
    user_id: string,
    product_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx)
      .where("user_id", user_id)
      .andWhere("product_id", product_id)
      .delete();
  }

  async getUserWishlists(
    user_id: string
    // options: QueryOptionConfig
  ): Promise<WishlistType | null> {
    const wishlist = await this.query()
      .where("wishlist.user_id", user_id)
      .join("products", "wishlist.product_id", "products._id")
      .leftJoin(
        this.knex.raw(`
              LATERAL (
                SELECT json_agg(
                  json_build_object('public_id', pi.public_id, 'link', pi.link)
                ) AS images
                FROM product_images pi
                WHERE pi.product_id = products._id
              ) AS image_data
            `),
        this.knex.raw("TRUE")
      )
      .groupBy("wishlist.user_id")
      .select(
        "wishlist.user_id as _id",
        this.knex.raw(
          `
              json_agg(
                json_build_object(
                  '_id', products._id,
                  'name', products.name,
                  'category', products.category,
                  'discount', products.discount,
                  'stock', products.stock,
                  'discount_expire', products.discount_expire,
                  'price', products.price,
                  'slug', products.slug,
                  'images', COALESCE(image_data.images, '[]'::json)
                )
              ) AS items
            `
        )
      )
      .first();

    return wishlist ? (wishlist as WishlistType) : null;
  }

  async isWishlist(
    user_id: string,
    product_id: string,
    trx?: Knex.Transaction
  ): Promise<boolean> {
    const exists = await this.query(trx)
      .where("user_id", user_id)
      .andWhere("product_id", product_id)
      .first();

    return !!exists;
  }

  async clearUserWishlists(user_id: string): Promise<void> {
    await this.query().where("user_id", user_id).delete();
  }
}
