import { type NextRequest, NextResponse } from "next/server";
import { CartService } from "../services/cart.service";
import { CartValidation } from "../dtos/cart.dto";
import { CartTranslate } from "@/public/locales/server/Cart.Translate";
import { lang } from "@/app/lib/utilities/lang";

class CartController {
  constructor(private readonly cartService = new CartService()) {}
  async getMyCart(req: NextRequest) {
    try {
      const cart = await this.cartService.getMyCart(req.user._id);

      return this.response(cart);
    } catch (err) {
      throw err;
    }
  }
  async addToCart(req: NextRequest) {
    try {
      const body = await req.json();
      const result = CartValidation.isCartValid({
        productId: req.id,
        ...body,
      });
      const cart = await this.cartService.addToCart(
        req.user._id,
        result.productId.toString(),
        result.quantity
      );
      return this.response(cart);
    } catch (err) {
      throw err;
    }
  }
  async decreaseQuantity(req: NextRequest) {
    try {
      const id = CartValidation.isValidProductId(req.id);
      const cart = await this.cartService.decreaseQuantity(
        req.user._id,
        id.toString()
      );
      return this.response(cart);
    } catch (err) {
      throw err;
    }
  }
  async removeProductFromCart(req: NextRequest) {
    try {
      const id = CartValidation.isValidProductId(req.id);
      const cart = await this.cartService.removeProductFromCart(
        req.user._id,
        id.toString()
      );
      return this.response(cart);
    } catch (err) {
      throw err;
    }
  }
  async clearCart(req: NextRequest) {
    try {
      const cart = await this.cartService.clearCart(req.user._id);
      return NextResponse.json(
        {
          success: true,

          message: CartTranslate[lang].clearCart,
        },
        { status: 200 }
      );
    } catch (err) {
      throw err;
    }
  }
  //   async checkout(req: NextRequest) {
  //     try {
  //       const order = await CartService.checkout(req.user.id);
  //       res.json(order);
  //     } catch (err) {
  //       res.status(500).json({ message: err.message });
  //     }
  //   }
  async saveLocalCartToDB(req: NextRequest) {
    try {
      const body = await req.json();
      const result = CartValidation.validateLocalCart(body);
      await this.cartService.saveLocalCartToDB(req.user._id, result);
      return NextResponse.json(
        {
          success: true,
          message: CartTranslate[lang].mergeLocalCart,
        },
        { status: 200 }
      );
    } catch (err) {
      throw err;
    }
  }
  async response(data: unknown, status = 200) {
    // const isObject = typeof data === "object";
    const isArray = Array.isArray(data);

    return NextResponse.json(
      {
        success: true,
        products: data,
      },
      { status }
    );
  }
}
export default new CartController();
