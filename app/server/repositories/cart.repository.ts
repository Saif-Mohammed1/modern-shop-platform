import type { Model, ClientSession } from "mongoose";

import type { CartItemsType } from "@/app/lib/types/cart.types";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";

import type { localCartDto } from "../dtos/cart.dto";
import type { ICart } from "../models/Cart.model";
import type { IProduct } from "../models/Product.model";

import { BaseRepository } from "./BaseRepository";

// Repository Service Pattern
export class CartRepository extends BaseRepository<ICart> {
  constructor(model: Model<ICart>) {
    super(model);
  }

  /**
   * Check if item exists in cart
   */
  async existingItem(productId: string, userId: string): Promise<ICart | null> {
    const cartItems = await this.model.findOne({ userId }).lean();
    if (!cartItems) {
      return null;
    }
    const item = cartItems.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) {
      return null;
    }
    return {
      ...cartItems,
      items: [item],
      // items: cartItems.items.filter(
      //   (item) => item.productId.toString() === productId
      // ),
    };
  }
  /**
   * Add item to user's cart
   */
  async addToCart(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId },
      {
        $addToSet: {
          items: {
            productId: assignAsObjectId(productId),
            quantity: 1,
          },
        },
        $set: { expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) }, // Set expiresAt to one week from now
      },
      { upsert: true, session }
    );
  }
  /**
   * Get user's cart with populated product details
   */
  // Optimized cart population with lean data
  async getUserCart(userId: string): Promise<CartItemsType[]> {
    const cartItems = await this.model
      .findOne({ userId })
      .populate<{ items: { productId: IProduct; quantity: number }[] }>({
        path: "items.productId",
        select: "name price images stock slug category discountExpire discount",
        match: {
          active: true,
          stock: { $gte: 1 },
        },
        options: { lean: true },
      })
      .lean();
    if (!cartItems) {
      return [];
    }
    // Filter out null productId and map to desired structure
    return (
      cartItems.items
        .filter((item) => !!item.productId)
        // .filter((item) => item.productId !== null)
        .map(({ productId, quantity }) => ({
          ...productId,
          _id: productId?._id.toString(),
          expiresAt: cartItems.expiresAt,
          quantity,
        }))
    );
  }
  // async getCartWithProducts(userId: string): Promise<ICart[]> {
  //   return await this.model.aggregate([
  //     { $match: { userId: assignAsObjectId(userId) } },
  //     {
  //       $lookup: {
  //         from: "Product",
  //         localField: "productId",
  //         foreignField: "_id",
  //         as: "product",
  //         pipeline: [
  //           { $match: { isActive: true } },
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
    userId: string,
    productId: string,
    newQuantity: number,
    session?: ClientSession
  ): Promise<void> {
    const exists = await this.model.exists({
      userId,
      "items.productId": productId,
    });

    if (!exists) {
      // Handle new item addition
      await this.model.updateOne(
        { userId },
        {
          $push: {
            items: {
              productId: assignAsObjectId(productId),
              quantity: newQuantity,
            },
          },
        },
        { session, upsert: true }
      );
      return;
    }
    await this.model.updateOne(
      { userId, "items.productId": assignAsObjectId(productId) },
      {
        $set: {
          "items.$.quantity": newQuantity,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
        }, // Set expiresAt to one week from now
      },
      { session, upsert: true }
    );
  }
  /**
   * Decrease cart item quantity
   */
  async decreaseQuantity(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId, "items.productId": assignAsObjectId(productId) },
      { $inc: { "items.$.quantity": -1 } },
      { session }
    );
  }
  /**
   * Remove item from cart
   */
  async removeProductFromCart(
    userId: string,
    productId: string,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId },
      { $pull: { items: { productId: assignAsObjectId(productId) } } },
      { session }
    );
  }

  /**
   * Clear user's entire cart
   */
  async clearCart(userId: string, session?: ClientSession): Promise<boolean> {
    const cart = await this.model.deleteMany({ userId }, { session });
    return cart.deletedCount !== 0;
  }
  async saveLocalCartToDB(
    userId: string,
    products: localCartDto,
    session?: ClientSession
  ): Promise<void> {
    // Convert local cart items to ObjectIds
    const productUpdates = products.map(({ _id, quantity }) => ({
      productId: _id,
      quantity,
    }));

    await this.model.updateOne(
      { userId },
      {
        // Add new items that don't exist in cart
        $addToSet: {
          items: {
            $each: productUpdates.filter((newItem) => ({
              $not: {
                $in: [newItem.productId, "$items.productId"],
              },
            })),
          },
        },
        // Update quantities for existing items
        $set: {
          "items.$[elem].quantity": {
            $let: {
              vars: {
                matchedProduct: {
                  $arrayElemAt: [
                    productUpdates,
                    {
                      $indexOfArray: [
                        productUpdates.map((p) => p.productId),
                        "$elem.productId",
                      ],
                    },
                  ],
                },
              },
              in: "$$matchedProduct.quantity",
            },
          },
        },
      },
      {
        arrayFilters: [
          { "elem.productId": { $in: productUpdates.map((p) => p.productId) } },
        ],
        upsert: true,
        session,
      }
    );
  }
  // async saveLocalCartToDB(
  //   userId: string,
  //   products: localCartDto,
  //   session?: ClientSession
  // ): Promise<void> {
  //   const bulkOps = products.map(({ _id, quantity }) => ({
  //     updateOne: {
  //       filter: { userId, productId: _id },
  //       update: { quantity },
  //       upsert: true,
  //       setDefaultsOnInsert: true,
  //     },
  //   }));
  //   await this.model.bulkWrite(bulkOps, { session });
  // }
  async deleteManyByProductId(
    userId: string,
    productIds: string[]
  ): Promise<void> {
    await this.model.updateMany(
      { userId },
      {
        $pull: {
          items: {
            productId: { $in: productIds.map((id) => assignAsObjectId(id)) },
          },
        },
      }
    );
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
