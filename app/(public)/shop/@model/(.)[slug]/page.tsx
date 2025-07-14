import type { ProductType } from "@/app/lib/types/products.types";
import api from "@/app/lib/utilities/api";
import ErrorHandler from "@/components/Error/errorHandler";
import ModelProductDetail from "@/components/ui/ModelProductDetail";
import OverlayWrapper from "@/components/ui/OverlayWrapper";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const GET_PRODUCT = `
  query GetProductMetaData($slug: String!) {
    getProductBySlug(slug: $slug) {
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
      }
    }
  }
`;
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;

  try {
    const {
      data: {
        data: {
          getProductBySlug: { product },
        },
      },
    }: {
      data: {
        data: {
          getProductBySlug: {
            product: ProductType;
          };
        };
      };
    } = await api.post("/graphql", {
      query: GET_PRODUCT,
      variables: {
        slug,
      },
    });
    return (
      <OverlayWrapper>
        <ModelProductDetail product={product} />
      </OverlayWrapper>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
