import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/app/lib/utilities/api";
import OverlayWrapper from "@/components/ui/OverlayWrapper";
import { headers } from "next/headers";
import ModelProductDetail from "@/components/ui/ModelProductDetail";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;
  try {
    const { data } = await api.get("/shop/" + slug + "/metadata", {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return (
      <OverlayWrapper>
        <ModelProductDetail product={data} />
      </OverlayWrapper>
    );
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
  }
};

export default page;
