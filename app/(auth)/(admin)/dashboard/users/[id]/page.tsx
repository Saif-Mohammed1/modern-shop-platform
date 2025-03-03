import api from "@/app/lib/utilities/api";
import UserAdminPage from "./userMangement";
import ErrorHandler from "@/components/Error/errorHandler";
type params = {
  id: string;
};
const page = async ({ params }: { params: params }) => {
  const { id } = params;
  try {
    const { data } = await api.get("/admin/dashboard/users/" + id);
    return <UserAdminPage user={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error.message} />;
  }
};

export default page;
