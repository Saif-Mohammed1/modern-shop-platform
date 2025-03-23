import api from "@/app/lib/utilities/api";
// import AppError from "@/components/util/appError";
import ErrorHandler from "@/components/Error/errorHandler";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { ordersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/ordersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import AdminOrderDetails from "@/components/(admin)/dashboard/orders/OrderDetails";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  try {
    const { data } = await api.get(`/admin/dashboard/orders/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return {
      title: `${ordersTranslate.orders[lang].details.metadata.title}: ${data._id}`,
      description: ordersTranslate.orders[lang].details.metadata.description,
      keywords: ordersTranslate.orders[lang].details.metadata.keywords,
    };
  } catch (error) {
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
    const { data } = await api.get(`/admin/dashboard/orders/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });

    return <AdminOrderDetails order={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;

    // throw new AppError(error.message, error.status);
  }
};

export default page;
