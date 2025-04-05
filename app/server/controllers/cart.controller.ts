import {type NextRequest, NextResponse} from 'next/server';

import AppError from '@/app/lib/utilities/appError';
import {lang} from '@/app/lib/utilities/lang';
import {AuthTranslate} from '@/public/locales/server/Auth.Translate';
import {CartTranslate} from '@/public/locales/server/Cart.Translate';

import {CartValidation} from '../dtos/cart.dto';
import {CartService} from '../services/cart.service';

class CartController {
  constructor(private readonly cartService: CartService = new CartService()) {}
  async getMyCart(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const cart = await this.cartService.getMyCart(req.user._id.toString());

    return this.response(cart);
  }
  async addToCart(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const body = await req.json();
    const result = CartValidation.isCartValid({
      ...body,
      productId: req.id,
    });
    const cart = await this.cartService.addToCart(
      req.user._id.toString(),
      result.productId.toString(),
      result.quantity,
    );
    return this.response(cart);
  }
  async decreaseQuantity(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const id = CartValidation.isValidProductId(req.id);
    const cart = await this.cartService.decreaseQuantity(req.user._id.toString(), id.toString());
    return this.response(cart);
  }
  async removeProductFromCart(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const id = CartValidation.isValidProductId(req.id);
    const cart = await this.cartService.removeProductFromCart(
      req.user._id.toString(),
      id.toString(),
    );
    return this.response(cart);
  }
  async clearCart(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    await this.cartService.clearCart(req.user._id.toString());
    return NextResponse.json(
      {
        success: true,

        message: CartTranslate[lang].clearCart,
      },
      {status: 200},
    );
  }
  //   async checkout(req: NextRequest) {
  //
  //       const order = await CartService.checkout(req.user.id);
  //       res.json(order);
  //     } catch (err) {
  //       res.status(500).json({ message: err.message });
  //     }
  //   }
  async saveLocalCartToDB(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const body = await req.json();
    const result = CartValidation.validateLocalCart(body);
    await this.cartService.saveLocalCartToDB(req.user._id.toString(), result);
    return NextResponse.json(
      {
        success: true,
        message: CartTranslate[lang].mergeLocalCart,
      },
      {status: 200},
    );
  }
  response(data: unknown, status = 200) {
    // const isObject = typeof data === "object";
    // const isArray = Array.isArray(data);

    return NextResponse.json(
      {
        success: true,
        products: data,
      },
      {status},
    );
  }
}
export default new CartController();
