import { ClientSession } from "mongoose";
import { BaseRepository } from "./BaseRepository";
import { CartItemsType } from "@/app/lib/types/cart.types";
import { Model } from "mongoose";
import { ICart } from "../models/Cart.model";
import Product, { IProduct } from "../models/Product.model";

// Repository Service Pattern
export class CartRepository extends BaseRepository<ICart> {
  constructor(model: Model<ICart>) {
    super(model);
  }
  /**
   * Add item to user's cart
   */
  async addToCart(
    userId: string,
    productId: string,
    quantity: number = 1,
    session?: ClientSession
  ): Promise<Partial<CartItemsType>[] | []> {
    const existingItem = await this.model.findOne({
      userId,
      productId,
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save({ session });
    } else {
      await this.model.create([{ userId, productId, quantity }], {
        session,
      });
    }

    return this.getUserCart(userId);
  }

  /**
   * Get user's cart with populated product details
   */
  async getUserCart(userId: string): Promise<Partial<CartItemsType>[] | []> {
    const cartItems = await this.model
      .find({ userId })
      .populate<{ productId: IProduct }>({
        path: "productId",
        match: { isActive: true }, // Only include active products
        options: { lean: true },
      })
      .lean();

    return cartItems
      .filter((item) => item.productId !== null)
      .map(({ productId, quantity }) => ({
        product: {
          _id: productId._id,
          name: productId.name,
          price: productId.price,
          images: productId.images,
          stock: productId.stock,
          slug: productId.slug,
          category: productId.category,
        },
        quantity,
      }));
  }

  /**
   * Update cart item quantity
   */
  async updateQuantity(
    userId: string,
    productId: string,
    newQuantity: number,
    session?: ClientSession
  ): Promise<Partial<CartItemsType>[] | []> {
    if (newQuantity < 1) {
      return this.removeFromCart(userId, productId);
    }

    const product = await Product.findById(productId);
    if (!product || product.stock < newQuantity) {
      throw new Error(
        !product ? "Product not found" : "Insufficient product stock"
      );
    }

    await this.model.updateOne(
      { userId, productId },
      { $set: { quantity: newQuantity } },
      { session }
    );

    return this.getUserCart(userId);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(
    userId: string,
    productId: string
  ): Promise<Partial<CartItemsType>[] | []> {
    await this.model.deleteOne({ userId, productId });
    return this.getUserCart(userId);
  }

  /**
   * Clear user's entire cart
   */
  async clearCart(userId: string): Promise<void> {
    await this.model.deleteMany({ userId });
  }
  async startSession(): Promise<ClientSession> {
    return this.model.db.startSession();
  }
}
