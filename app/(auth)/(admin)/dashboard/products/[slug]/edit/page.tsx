import type { Metadata } from "next";
import { headers } from "next/headers";

import type { ProductType } from "@/app/lib/types/products.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import EditProduct from "@/components/(admin)/dashboard/products/EditProductForm";
import ErrorHandler from "@/components/Error/errorHandler";
import { productsTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/productTranslate";

// GraphQL query to get product for admin editing
const GET_PRODUCT_FOR_EDIT = /* GraphQL */ `
  query GetProductForEdit($slug: String!) {
    getProductBySlug(slug: $slug, populate: true) {
      product {
        _id
        name
        description
        price
        category
        stock
        ratings_average
        ratings_quantity
        slug
        status
        images {
          _id
          link
          public_id
        }
        discount
        discount_expire
        specifications {
          key
          value
        }
      }
    }
  }
`;

// GraphQL query for metadata (lighter query)
const GET_PRODUCT_METADATA = /* GraphQL */ `
  query GetProductMetadata($slug: String!) {
    getProductBySlug(slug: $slug, populate: false) {
      product {
        name
        description
      }
    }
  }
`;

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
  const headersObj = Object.fromEntries((await headers()).entries());

  try {
    const {
      getProductBySlug: { product },
    } = await api_gql<{
      getProductBySlug: {
        product: {
          name: string;
          description: string;
        };
      };
    }>(GET_PRODUCT_METADATA, { slug }, headersObj);

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
  const headersObj = Object.fromEntries((await headers()).entries());

  try {
    const {
      getProductBySlug: { product },
    } = await api_gql<{
      getProductBySlug: {
        product: ProductType; // You can replace 'any' with your Product type
      };
    }>(GET_PRODUCT_FOR_EDIT, { slug }, headersObj);

    return <EditProduct defaultValues={product} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
