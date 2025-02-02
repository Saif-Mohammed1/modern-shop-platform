import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/components/util/api";
import OverlayWrapper from "@/components/util/OverlayWrapper";
import { headers } from "next/headers";
import ModelProductDetail from "@/components/util/ModelProductDetail";
type Props = {
  params: {
    id: string;
  };
};
const page = async ({ params }: Props) => {
  const { id } = params;

  try {
    const { data } = await api.get("/shop/" + id, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    const product = data.data;
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
