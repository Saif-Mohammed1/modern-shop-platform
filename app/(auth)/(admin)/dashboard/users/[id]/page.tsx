import api from '@/app/lib/utilities/api';
import ErrorHandler from '@/components/Error/errorHandler';

import UserAdminPage from './userMangement';

type params = {
  id: string;
};
const page = async (props: {params: Promise<params>}) => {
  const params = await props.params;
  const {id} = params;
  try {
    const {data} = await api.get('/admin/dashboard/users/' + id);
    return <UserAdminPage user={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
  }
};

export default page;
