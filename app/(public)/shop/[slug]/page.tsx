import type { Metadata } from "next";

import type { ProductType } from "@/app/lib/types/products.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ErrorHandler from "@/components/Error/errorHandler";
import ProductDetail from "@/components/products/product-details/productDetails";
import { shopPageTranslate } from "@/public/locales/client/(public)/shop/shoppageTranslate";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const GET_PRODUCT_METADATA = `
  query GetProductMetaData($slug: String!) {
    getProductBySlug(slug: $slug) {
      product {
        name
        description
      }
    }
  }
`;
const GET_PRODUCT = /* GraphQL */ `
  query GetProductMetaData($slug: String!, $populate: Boolean) {
    getProductBySlug(slug: $slug, populate: $populate) {
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
        images {
          _id
          link
          public_id
        }
        shipping_info {
          weight
          dimensions {
            length
            width
            height
          }
        }
        reviews {
          _id
          user_name
          rating
          comment
          created_at
        }
      }
      distribution {
        one
        two
        three
        four
        five
      }
    }
  }
`;
const getProductMetaData = async (slug: string) => {
  const { getProductBySlug } = await api_gql<{
    getProductBySlug: {
      product: Pick<ProductType, "name" | "description">;
    };
  }>(GET_PRODUCT_METADATA, { slug });
  return getProductBySlug;
};
const getProductData = async (slug: string) => {
  const {
    getProductBySlug: { product, distribution },
  } = await api_gql<{
    getProductBySlug: {
      product: ProductType;
      distribution: {
        one: number;
        two: number;
        three: number;
        four: number;
        five: number;
      };
    };
  }>(GET_PRODUCT, {
    slug,
    populate: true,
  });

  return {
    product,
    distribution,
    // relatedProducts,
  };
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;
  // api.get(`/customers/reviews/${product._slug}
  try {
    const { product } = await getProductMetaData(slug);
    return {
      title: `${shopPageTranslate[lang].metadata.title} - ${product.name}`,
      description: `${shopPageTranslate[lang].metadata.description} - ${
        product.description
      }`,
      keywords: `${shopPageTranslate[lang].metadata.keywords}, ${product.name}`,
    };
  } catch (_error) {
    return {
      title: shopPageTranslate[lang].metadata.title,
      description: shopPageTranslate[lang].metadata.description,
      keywords: shopPageTranslate[lang].metadata.keywords,
    };
  }
}
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;

  try {
    const { product, distribution } = await getProductData(slug);
    // change distribution from {one: 0, two: 0, three: 0, four: 0, five: 0} to {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    const distributionModified: Record<string, number> = {};
    distributionModified["1"] = distribution.one;
    distributionModified["2"] = distribution.two;
    distributionModified["3"] = distribution.three;
    distributionModified["4"] = distribution.four;
    distributionModified["5"] = distribution.five;

    return (
      // <ComponentLoading>
      // </ComponentLoading>
      <ProductDetail
        product={product}
        distribution={distributionModified}
        // reviews={product.reviews}
        // relatedProducts={relatedProducts || []}
      />
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
