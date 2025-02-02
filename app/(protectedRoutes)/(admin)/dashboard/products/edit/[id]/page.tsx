import { productsTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/productTranslate";
import EditProduct from "@/components/(admin)/dashboard/products/editProduct/editProduct";
import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/components/util/api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
// export const metadata = {
//   title: "Edit Product",
//   description: "Edit product for the admin",
//   keywords: "admin, edit product, admin edit product",
// };
type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  try {
    const {
      data: { data: product },
    } = await api.get(`/admin/dashboard/products/${id}`, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });

    return {
      title: `${productsTranslate.products[lang].editProduct.metadata.title} - ${product.name}`,
      description: `${productsTranslate.products[lang].editProduct.metadata.description} ${product.name}. ${product.description}`,
      keywords: `${productsTranslate.products[lang].editProduct.metadata.keywords}, ${product.name}, ${product.description}`,
    };
  } catch (error) {
    return {
      title: productsTranslate.products[lang].editProduct.metadata.title,
      description:
        productsTranslate.products[lang].editProduct.metadata.description,
      keywords: productsTranslate.products[lang].editProduct.metadata.keywords,
    };
  }
}
const page = async ({ params }: Props) => {
  const { id } = params;

  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/products/${id}`, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    return <EditProduct product={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;
  }
};

export default page;
