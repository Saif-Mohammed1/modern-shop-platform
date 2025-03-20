import { NextResponse, type NextRequest } from "next/server";
import { stripe, StripeService } from "../services/stripe.service";
import { StripeValidation } from "../dtos/stripe.dto";
import AppError from "@/app/lib/utilities/appError";
import { AuthTranslate } from "@/public/locales/server/Auth.Translate";
import { lang } from "@/app/lib/utilities/lang";

class StripeController {
  private stripeService = new StripeService();
  async createStripeSession(req: NextRequest) {
    if (!req.user) {
      throw new AppError(AuthTranslate[lang].errors.userNotFound, 404);
    }
    console.count("createStripeSession");
    const body = await req.json();
    const result = StripeValidation.validateShippingInfo(body.shippingInfo);
    const session = await this.stripeService.createStripeSession(
      req.user,
      result
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
