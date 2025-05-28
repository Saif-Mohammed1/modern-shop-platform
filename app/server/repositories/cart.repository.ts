import type { Knex } from "knex";

import type { ICartItemDB, CartItemsType } from "@/app/lib/types/cart.db.types";
import { generateUUID } from "@/app/lib/utilities/id";

import type { localCartDto } from "../dtos/cart.dto";

import { BaseRepository } from "./BaseRepository";

// Repository Service Pattern
export class CartRepository extends BaseRepository<ICartItemDB> {
  constructor(knex: Knex) {
    super(knex, "cart_items");
  }

  /**
   * Check if item exists in cart
   */
  async existingItem(
    product_id: string,
    user_id: string
  ): Promise<ICartItemDB | null> {
    const cartItems =
      (await this.query()
        .where("user_id", user_id)
        .andWhere("product_id", product_id)
        .first()) ?? null;

    return cartItems;
  }
  /**
   * Add item to user's cart
   */
  // async addToCart(
  //   user_id: string,
  //   product_id: string,
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   await this.knex.updateOne(
  //     { user_id },
  //     {
  //       $addToSet: {
  //         items: {
  //           product_id: assignAsObjectId(product_id),
  //           quantity: 1,
  //         },
  //       },
  //       $set: { expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) }, // Set expires_at to one week from now
  //     },
  //     { upsert: true, trx }
  //   );
  // }
  /**
   * Get user's cart with populated product details
   */
  // Optimized cart population with lean data
  async getUserCart(user_id: string): Promise<CartItemsType[]> {
    const cartItems = (await this.query()
      .where("cart_items.user_id", user_id)
      .join("products", "cart_items.product_id", "products._id")
      //   .leftJoin("product_images", "products._id", "product_images.product_id")
      //   .groupBy("cart_items._id", "products._id")
      //   .select(
      //     "cart_items._id",
      //     this.knex.raw(`
      //   json_build_object(
      //     'product_id', products._id,
      //     'name', products.name,
      //     'price', products.price,
      //     'slug', products.slug,
      //     'images', COALESCE(json_agg(
      //       json_build_object('public_id', product_images.public_id, 'link', product_images.link)
      //     ) FILTER (WHERE product_images._id IS NOT NULL), '[]'::json),
      //     'stock', products.stock,
      //     'category', products.category,
      //     'discount_expire', products.discount_expire,
      //     'discount', products.discount
      //   ) AS item
      // `)
      //   )
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
      .groupBy("cart_items.user_id")
      .select(
        "cart_items.user_id as _id",
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
                  'quantity', cart_items.quantity,
                  'images', COALESCE(image_data.images, '[]'::json)
                )
              ) AS items
            `
        )
      )
      .first()) as { items: CartItemsType[]; _id: string };
    if (!cartItems) {
      return [];
    }
    // Filter out null product_id and map to desired structure

    return cartItems.items ? cartItems.items : [];
  }
  // async getCartWithProducts(user_id: string): Promise<ICartItemDB[]> {
  //   return await this.knex.aggregate([
  //     { $match: { user_id: assignAsObjectId(user_id) } },
  //     {
  //       $lookup: {
  //         from: "Product",
  //         localField: "product_id",
  //         foreignField: "_id",
  //         as: "product",
  //         pipeline: [
  //           { $match: { is_active: true } },
  //           { $project: { name: 1, price: 1, images: 1, stock: 1, slug: 1 } },
  //         ],
  //       },
  //     },
  //     { $unwind: "$product" },
  //     {
  //       $project: {
  //         _id: 0,
  //         product: "$product",
  //         quantity: 1,
  //       },
  //     },
  //   ]);
  // }
  /**
   * increase cart item quantity
   */
  async increaseQuantity(
    user_id: string,
    product_id: string,
    newQuantity: number,
    trx?: Knex.Transaction
  ): Promise<void> {
    const id = generateUUID();
    await this.query(trx)
      .insert({
        user_id: user_id,
        product_id: product_id,
        quantity: newQuantity,
        _id: id,
      })
      .onConflict(["user_id", "product_id"])
      .merge({
        quantity: this.knex.raw("cart_items.quantity + ?", newQuantity),
        updated_at: this.knex.fn.now(),
      });
  }
  /**
   * Decrease cart item quantity
   */
  async decreaseQuantity(
    user_id: string,
    product_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    const cartItem = await this.query(trx)
      .where("user_id", user_id)
      .andWhere("product_id", product_id)
      .first();

    if (cartItem) {
      if (cartItem.quantity > 1) {
        await this.query(trx)
          .where("user_id", user_id)
          .andWhere("product_id", product_id)
          .increment("quantity", -1);
      } else {
        await this.removeProductFromCart(user_id, product_id, trx);
      }
    }
  }
  /**
   * Remove item from cart
   */
  async removeProductFromCart(
    user_id: string,
    product_id: string,
    trx?: Knex.Transaction
  ): Promise<void> {
    await this.query(trx)
      .where("user_id", user_id)
      .andWhere("product_id", product_id)
      .delete();
  }

  /**
   * Clear user's entire cart
   */
  async clearCart(user_id: string, trx?: Knex.Transaction): Promise<boolean> {
    const cart = await this.query(trx).where("user_id", user_id).delete();
    return cart > 0;
  }
  async saveLocalCartToDB(
    user_id: string,
    products: localCartDto,
    trx?: Knex.Transaction
  ): Promise<void> {
    // Convert local cart items to ObjectIds
    const productUpdates = products.map(
      ({ _id, quantity }): Omit<ICartItemDB, "created_at" | "updated_at"> => ({
        _id: generateUUID(),
        user_id: user_id,
        product_id: _id,
        quantity,
      })
    );

    await this.query(trx)
      .insert(productUpdates)
      .onConflict(["user_id", "product_id"])
      .merge();
  }

  // async saveLocalCartToDB(
  //   user_id: string,
  //   products: localCartDto,
  //   trx?: Knex.Transaction
  // ): Promise<void> {
  //   const bulkOps = products.map(({ _id, quantity }) => ({
  //     updateOne: {
  //       filter: { user_id, product_id: _id },
  //       update: { quantity },
  //       upsert: true,
  //       setDefaultsOnInsert: true,
  //     },
  //   }));
  //   await this.knex.bulkWrite(bulkOps, { trx });
  // }
  async deleteManyByProductId(
    user_id: string,
    productIds: string[]
  ): Promise<void> {
    await this.query()
      .where("user_id", user_id)
      .whereIn("product_id", productIds)
      .delete();
  }
}
