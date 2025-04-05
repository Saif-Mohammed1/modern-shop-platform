import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import EditProduct from "@/components/(admin)/dashboard/products/EditProductForm";
import ErrorHandler from "@/components/Error/errorHandler";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

// export const metadata = {
//   title: "Edit Product",
//   description: "Edit product for the admin",
//   keywords: "admin, edit product, admin edit product",
// };
type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  try {
    const { data: product } = await api.get(
      `/admin/dashboard/products/${slug}`,
      {
        headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
      }
    );

    return {
      title: `${productsTranslate.products[lang].editProduct.metadata.title} - ${product.name}`,
      description: `${productsTranslate.products[lang].editProduct.metadata.description} ${product.name}. ${product.description}`,
      keywords: `${productsTranslate.products[lang].editProduct.metadata.keywords}, ${product.name}, ${product.description}`,
    };
  } catch (_error) {
    return {
      title: productsTranslate.products[lang].editProduct.metadata.title,
      description:
        productsTranslate.products[lang].editProduct.metadata.description,
      keywords: productsTranslate.products[lang].editProduct.metadata.keywords,
    };
  }
}
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;

  try {
    const { data } = await api.get(`/admin/dashboard/products/${slug}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return <EditProduct defaultValues={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;
  }
};

export default page;
