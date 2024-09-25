import { accountOrdersTranslate } from "@/app/_translate/(protectedRoute)/account/ordersTranslate";
import OrderCancellation from "@/components/shop/orders/cancellingReason";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: accountOrdersTranslate[lang].orderCancellation.metadata.title,
  description:
    accountOrdersTranslate[lang].orderCancellation.metadata.description,
  keywords: accountOrdersTranslate[lang].orderCancellation.metadata.keywords,
};
const page = () => {
  return <OrderCancellation />;
};

export default page;
