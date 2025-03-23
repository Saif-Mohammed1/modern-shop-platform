import { NextRequest, NextResponse } from "next/server";
import { OrderValidation } from "../dtos/order.dto";
import { OrderService } from "../services/order.service";
import AppError from "@/app/lib/utilities/appError";
import { OrderTranslate } from "@/public/locales/server/Order.Translate";
import { lang } from "@/app/lib/utilities/lang";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

class OrderController {
  constructor(
    private readonly orderService: OrderService = new OrderService()
  ) {}
  async createOrder(req: NextRequest) {
    const body = await req.json();
    const dto = OrderValidation.validateCreateOrder(body);
    const order = await this.orderService.createOrder(dto);
    return NextResponse.json(order, { status: 201 });
  }

  async getOrders(req: NextRequest) {
    const orders = await this.orderService.getOrders({
      query: req.nextUrl.searchParams,
      populate: true,
    });
    return NextResponse.json(orders, { status: 200 });
  }

  async getOrderById(req: NextRequest) {
    if (!req.id) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    const order = await this.orderService.getOrderById(req.id);
    return NextResponse.json(order, { status: 200 });
  }
  async getLatestOrder(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const order = await this.orderService.getLatestOrder(
      req.user?._id.toString()
    );
    return NextResponse.json(order, { status: 200 });
  }
  async getOrdersByUserId(req: NextRequest) {
    if (!req.user?._id) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const orders = await this.orderService.getOrdersByUserId(
      req.user?._id.toString(),
      {
        query: req.nextUrl.searchParams,
        populate: true,
      }
    );
    return NextResponse.json(orders, { status: 200 });
  }
  async updateOrderStatus(req: NextRequest) {
    if (!req.id) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    const body = await req.json();
    const dto = OrderValidation.validateUpdateOrderStatus(body);
    const order = await this.orderService.updateOrderStatus(req.id, dto.status);
    return NextResponse.json(order, { status: 200 });
  }
  async updateOrder(req: NextRequest) {
    if (!req.id) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    const body = await req.json();
    const dto = OrderValidation.validateUpdateOrder(body);
    const order = await this.orderService.updateOrder(req.id, dto);
    return NextResponse.json(order, { status: 200 });
  }

  async deleteOrder(req: NextRequest) {
    if (!req.id) {
      throw new AppError(OrderTranslate[lang].errors.noDocumentsFound, 404);
    }
    await this.orderService.deleteOrder(req.id);
    return NextResponse.json(
      { message: OrderTranslate[lang].functions.delete.success },
      { status: 200 }
    );
  }
}
export default new OrderController();
