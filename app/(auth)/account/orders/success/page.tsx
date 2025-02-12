export const dynamic = "force-dynamic";
import OrderCompleted from "@/components/shop/orders/orderCompletedPrushers";
import api from "@/app/lib/util/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { accountOrdersTranslate } from "@/app/_translate/(auth)/account/ordersTranslate";
import { lang } from "@/app/lib/util/lang";
export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].orderCompleted.metadata.title,
  description: accountOrdersTranslate[lang].orderCompleted.metadata.description,
  keywords: accountOrdersTranslate[lang].orderCompleted.metadata.keywords,
};
const page = async () => {
  try {
    const { data } = await api.get("/customer/orders/latest-order", {
      headers: Object.fromEntries(headers().entries()), // convert headers to object
    });
    const order = data.data;
    return <OrderCompleted order={order} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
