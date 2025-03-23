// import { handleStripeWebhook } from "@/app/_server/controllers/stripeController";
import { type NextRequest } from "next/server";
import { connectDB } from "@/app/server/db/db";
import ErrorHandler from "@/app/server/controllers/error.controller";
import stripeController from "@/app/server/controllers/stripe.controller";
// /stripe-purchasers/webhooks
export const POST = async (req: NextRequest) => {
  try {
    await connectDB();
    return await stripeController.handleWebhookEvent(req);
  } catch (error) {
    return ErrorHandler(error, req);
  }
};
// export const POST = async (req: NextRequest) => {
//   try {
//     await connectDB();

//     const result = await handleStripeWebhook(req);
//     if (!result) {
//       throw new Error("Error in stripe webhook");
//     }
//     const { statusCode } = result;
//     if ("session" in result) {
//       return NextResponse.json(
//         { session: result.session },
//         { status: statusCode }
//       );
//     }
//     return NextResponse.json(
//       { message: "No session available" },
//       { status: statusCode }
//     );
//   } catch (error) {
//     return ErrorHandler(error, req);
//   }
// };
