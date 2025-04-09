import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import ErrorHandler from "@/components/Error/errorHandler";
import ModelProductDetail from "@/components/ui/ModelProductDetail";
import OverlayWrapper from "@/components/ui/OverlayWrapper";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const page = async (props: Props) => {
  const params = await props.params;
  const { slug } = params;
  try {
    const { data } = await api.get(`/shop/${slug}/metadata`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return (
      <OverlayWrapper>
        <ModelProductDetail product={data} />
      </OverlayWrapper>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
