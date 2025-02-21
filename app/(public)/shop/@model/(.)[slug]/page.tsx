import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/app/lib/utilities/api";
import OverlayWrapper from "@/components/ui/OverlayWrapper";
import ModelProductDetail from "@/components/ui/ModelProductDetail";
type Props = {
  params: {
    slug: string;
  };
};
const page = async ({ params }: Props) => {
  const { slug } = params;

  try {
    const {
      data: { product },
    } = await api.get(
      "/shop/" + slug + "/metadata"

      //   {
      //   headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
      // }
    );
    return (
      <OverlayWrapper>
        <ModelProductDetail product={product} />
      </OverlayWrapper>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
  }
};

export default page;
