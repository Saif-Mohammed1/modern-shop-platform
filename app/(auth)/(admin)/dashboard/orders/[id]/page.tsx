import type { Metadata } from "next";
import { headers } from "next/headers";

import type { OrderType } from "@/app/lib/types/orders.db.types";
import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import { lang } from "@/app/lib/utilities/lang";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";
import ErrorHandler from "@/components/Error/errorHandler";
import { ordersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  try {
    const {
      data,
    }: {
      data: OrderType;
    } = await api.get(`/admin/dashboard/orders/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return {
      title: `${data?.user_info?.name} - ${ordersTranslate.orders[lang].details.metadata.title}`,
      description: ordersTranslate.orders[lang].details.metadata.description,
      keywords: ordersTranslate.orders[lang].details.metadata.keywords,
    };
  } catch (_error) {
    return {
      title: ordersTranslate.orders[lang].details.metadata.title,
      description: ordersTranslate.orders[lang].details.metadata.description,
      keywords: ordersTranslate.orders[lang].details.metadata.keywords,
    };
  }
}

const page = async (props: Props) => {
  const params = await props.params;
  const { id } = params;
  try {
    const {
      data,
    }: {
      data: OrderType;
    } = await api.get(`/admin/dashboard/orders/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });

    return <AdminOrderDetails order={data} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
