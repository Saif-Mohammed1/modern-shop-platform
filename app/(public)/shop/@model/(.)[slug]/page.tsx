import api from '@/app/lib/utilities/api';
import ErrorHandler from '@/components/Error/errorHandler';
import ModelProductDetail from '@/components/ui/ModelProductDetail';
import OverlayWrapper from '@/components/ui/OverlayWrapper';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};
const page = async (props: Props) => {
  const params = await props.params;
  const {slug} = params;

  try {
    const {data: product} = await api.get('/shop/' + slug + '/metadata');
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
