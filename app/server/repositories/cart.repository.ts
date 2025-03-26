import type { ClientSession } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import type { CartItemsType } from "@/app/lib/types/cart.types";
import { Model } from "mongoose";
import type { ICart } from "../models/Cart.model";
import type { IProduct } from "../models/Product.model";
import { assignAsObjectId } from "@/app/lib/utilities/assignAsObjectId";
import type { localCartDto } from "../dtos/cart.dto";
// Repository Service Pattern
export class CartRepository extends BaseRepository<ICart> {
  constructor(model: Model<ICart>) {
    super(model);
  }

  /**
   * Check if item exists in cart
   */
  async existingItem(productId: string, userId: string): Promise<ICart | null> {
    return this.model.findOne({ productId, userId }).lean();
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
      { userId, productId },
      { $inc: { quantity: 1 } },
      { upsert: true, session, setDefaultsOnInsert: true }
    );
  }
  /**
   * Get user's cart with populated product details
   */
  // Optimized cart population with lean data
  async getUserCart(userId: string): Promise<CartItemsType[]> {
    const cartItems = await this.model
      .find({ userId })
      .populate<{ productId: IProduct }>({
        path: "productId",
        select: "name price images stock slug category discountExpire discount",
        match: {
          active: true,
          stock: { $gte: 1 },
        },
        options: { lean: true },
      })
      .lean();

    return cartItems
      .filter((item) => item.productId !== null)
      .map(({ productId, quantity, expiresAt }) => ({
        ...productId,
        _id: productId!._id.toString(),
        expiresAt,
        quantity,
      }));
  }
  async getCartWithProducts(userId: string): Promise<ICart[]> {
    return await this.model.aggregate([
      { $match: { userId: assignAsObjectId(userId) } },
      {
        $lookup: {
          from: "Product",
          localField: "productId",
          foreignField: "_id",
          as: "product",
          pipeline: [
            { $match: { isActive: true } },
            { $project: { name: 1, price: 1, images: 1, stock: 1, slug: 1 } },
          ],
        },
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 0,
          product: "$product",
          quantity: 1,
        },
      },
    ]);
  }
  /**
   * increase cart item quantity
   */
  async increaseQuantity(
    userId: string,
    productId: string,
    newQuantity: number,
    session?: ClientSession
  ): Promise<void> {
    await this.model.updateOne(
      { userId, productId },
      { $set: { quantity: newQuantity } },
      { session, upsert: true, setDefaultsOnInsert: true }
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
      { userId, productId },
      { $inc: { quantity: -1 } },
      { session }
    );
  }
  /**
   * Remove item from cart
   */
  async removeProductFromCart(
    userId: string,
    productId: string
  ): Promise<void> {
    await this.model.deleteOne({ userId, productId });
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
    const bulkOps = products.map(({ _id, quantity }) => ({
      updateOne: {
        filter: { userId, productId: _id },
        update: { quantity },
        upsert: true,
        setDefaultsOnInsert: true,
      },
    }));
    await this.model.bulkWrite(bulkOps, { session });
  }
  async deleteManyByProductId(
    userId: string,
    productIds: string[]
  ): Promise<void> {
    await this.model.deleteMany({ userId, productId: { $in: productIds } });
  }
  async startSession(): Promise<ClientSession> {
    return await this.model.db.startSession();
  }
}
