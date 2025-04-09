import { ipAddress } from "@vercel/functions";
import { type NextRequest, NextResponse } from "next/server";

import AppError from "@/app/lib/utilities/appError";
import { lang } from "@/app/lib/utilities/lang";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";

import { LogsValidation } from "../dtos/logs.dto";
import { StripeValidation } from "../dtos/stripe.dto";
import { StripeService, stripe } from "../services/stripe.service";

class StripeController {
  constructor(
    private readonly stripeService: StripeService = new StripeService()
  ) {}
  async createStripeSession(req: NextRequest) {
    if (!req.user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    const ip =
      req.headers.get("x-client-ip") ||
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      ipAddress(req) ||
      "Unknown IP";

    const userAgent = req.headers.get("user-agent") ?? "Unknown User Agent";
    const logs = LogsValidation.validateLogs({
      ipAddress: ip,
      userAgent,
    });
    const { shippingInfo } = await req.json();
    const result = StripeValidation.validateShippingInfo(shippingInfo);
    const session = await this.stripeService.createStripeSession(
      req.user,
      result,
      logs
    );
    return NextResponse.json(session, { status: 200 });
  }
  async handleWebhookEvent(req: NextRequest) {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature")!;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    await this.stripeService.handleWebhookEvent(event);

    return NextResponse.json({ received: true });
  }
  // async createStripeCheckoutSession(req: NextRequest) {
  //   {
  //     const { products } = await this.cartService.getCart(user._id);
  //     const session = await this.stripeService.createCheckoutSession(
  //       user,
  //       shippingInfo,
  //       products
  //     );
  //     return session;
  //   }
  // }
}

export default new StripeController();
