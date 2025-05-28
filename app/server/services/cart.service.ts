import type { Knex } from "knex";

import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { CartTranslate } from "@/public/locales/server/Cart.Translate";

import { connectDB } from "../db/db";
import type { localCartDto } from "../dtos/cart.dto";
import { CartRepository } from "../repositories/cart.repository";

import { ProductService } from "./product.service";

export class CartService {
  constructor(
    private readonly repository: CartRepository = new CartRepository(
      connectDB()
    ),
    private readonly productService: ProductService = new ProductService()
  ) {}

  async getMyCart(user_id: string) {
    return await this.repository.getUserCart(user_id);
  }
  async addToCart(user_id: string, product_id: string, quantity: number = 1) {
    await this.repository.transaction(async (trx) => {
      const existingProduct = await this.productService.getProductById(
        product_id,
        trx
      );
      if (!existingProduct) {
        await this.repository.removeProductFromCart(user_id, product_id);
        throw new AppError(CartTranslate[lang].errors.productNotFound, 404);
      }
      if (existingProduct.stock < quantity) {
        throw new AppError(
          CartTranslate[lang].errors.insufficientStock(existingProduct.name),
          400
        );
      }
      // if (quantity === 1) {
      //
      //   await this.repository.addToCart(user_id, product_id, trx);
      //   return;
      // }
      await this.repository.increaseQuantity(
        user_id,
        product_id,
        quantity,
        trx
      );
    });
  }
  // async addToCart(user_id: string, product_id: string, quantity: number = 1) {
  //   const trx = await this.repository.startSession();
  //   trx.startTransaction();
  //   try {
  //     const existingProduct = await this.productService.getProductById(
  //       product_id,
  //       trx
  //     );
  //     if (!existingProduct) {
  //       await this.repository.removeProductFromCart(user_id, product_id);
  //       throw new AppError(CartTranslate[lang].errors.productNotFound, 404);
  //     }
  //     if (existingProduct.stock < quantity) {
  //       throw new AppError(
  //         CartTranslate[lang].errors.insufficientStock(existingProduct.name),
  //         400
  //       );
  //     }
  //     if (quantity === 1) {
  //       await this.repository.addToCart(user_id, product_id, trx);
  //       await trx.commitTransaction();
  //       return;
  //     }
  //     await this.repository.increaseQuantity(
  //       user_id,
  //       product_id,
  //       quantity,
  //       trx
  //     );
  //     await trx.commitTransaction();
  //   } catch (error) {
  //     await trx.abortTransaction();
  //     throw error;
  //   } finally {
  //     await trx.endSession();
  //   }
  // }
  /**
   * Decrease quantity of product in cart
   * this for decrease Quantity of product in cart
   * and delete product if quantity is 1
   */
  async decreaseQuantity(user_id: string, product_id: string) {
    const existingItem = await this.repository.existingItem(
      product_id,
      user_id
    );
    if (!existingItem) {
      throw new AppError(CartTranslate[lang].errors.productNotFound, 404);
    }
    if (existingItem.quantity === 1) {
      await this.repository.removeProductFromCart(user_id, product_id);
      return;
    }
    await this.repository.decreaseQuantity(user_id, product_id);
  }
  /**
   *
   * @param user_id
   * @param product_id
   * @returns
   *
   * Remove product from cart
   * this delete one product from cart no need to check quantity
   */
  async removeProductFromCart(user_id: string, product_id: string) {
    await this.repository.removeProductFromCart(user_id, product_id);
  }

  /**
   *
   * @param user_id
   * @returns
   *  Clear user's entire cart
   */
  async clearCart(user_id: string, trx?: Knex.Transaction): Promise<boolean> {
    return await this.repository.clearCart(user_id, trx);
  }
  async saveLocalCartToDB(user_id: string, products: localCartDto) {
    await this.repository.transaction(async (trx) => {
      await this.repository.saveLocalCartToDB(user_id, products, trx);
    });
  }
  async deleteManyByProductId(user_id: string, product_id: string[]) {
    await this.repository.deleteManyByProductId(user_id, product_id);
  }
}
