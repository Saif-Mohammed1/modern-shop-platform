import api from "@/app/lib/utilities/api";
import ErrorHandler from "@/components/Error/errorHandler";
import UserAdminPage from "@components/(admin)/dashboard/users/userMangement";

type params = {
  id: string;
};
const page = async (props: { params: Promise<params> }) => {
  const params = await props.params;
  const { id } = params;
  try {
    const { data } = await api.get(`/admin/dashboard/users/${id}`);
    return <UserAdminPage user={data} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
