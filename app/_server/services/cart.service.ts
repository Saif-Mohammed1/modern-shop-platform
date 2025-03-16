import AppError from "@/app/lib/utilities/appError";
import CartModel from "../models/Cart.model";
import { CartRepository } from "../repositories/cart.repository";
import { ProductService } from "./product.service";
import { CartTranslate } from "@/public/locales/server/Cart.Translate";
import { lang } from "@/app/lib/utilities/lang";
import { localCartDto } from "../dtos/cart.dto";
import { ClientSession } from "mongoose";

export class CartService {
  constructor(
    private readonly repository = new CartRepository(CartModel),
    private readonly productService = new ProductService()
  ) {}

  async getMyCart(userId: string) {
    return await this.repository.getUserCart(userId);
  }
  async addToCart(userId: string, productId: string, quantity: number = 1) {
    const existingProduct = await this.productService.getProductById(productId);
    if (!existingProduct) {
      await this.repository.removeProductFromCart(userId, productId);
      throw new AppError(CartTranslate[lang].errors.productNotFound, 404);
    }
    if (quantity == 1) {
      return await this.repository.addToCart(userId, productId);
    }
    if (existingProduct.stock < quantity) {
      throw new AppError(
        CartTranslate[lang].errors.insufficientStock(existingProduct.name),
        400
      );
    }
    return await this.repository.increaseQuantity(userId, productId, quantity);
  }
  /**
   * Decrease quantity of product in cart
   * this for decrease Quantity of product in cart
   * and delete product if quantity is 1
   */
  async decreaseQuantity(userId: string, productId: string) {
    const existingItem = await this.repository.existingItem(productId, userId);
    if (!existingItem) {
      throw new AppError(CartTranslate[lang].errors.productNotFound, 404);
    }
    if (existingItem.quantity === 1) {
      return await this.repository.removeProductFromCart(userId, productId);
    }
    return await this.repository.decreaseQuantity(userId, productId);
  }
  /**
   *
   * @param userId
   * @param productId
   * @returns
   *
   * Remove product from cart
   * this delete one product from cart no need to check quantity
   */
  async removeProductFromCart(userId: string, productId: string) {
    return await this.repository.removeProductFromCart(userId, productId);
  }

  /**
   *
   * @param userId
   * @returns
   *  Clear user's entire cart
   */
  async clearCart(userId: string, session?: ClientSession): Promise<boolean> {
    return await this.repository.clearCart(userId, session);
  }
  async saveLocalCartToDB(userId: string, products: localCartDto) {
    const session = await this.repository.startSession();
    session.startTransaction();
    try {
      await this.repository.saveLocalCartToDB(userId, products, session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  async deleteManyByProductId(userId: string, productId: string[]) {
    return await this.repository.deleteManyByProductId(userId, productId);
  }
}
