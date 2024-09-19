import EditUser from "@/components/(admin)/dashboard/users/editUser";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";

const page = async ({ params }) => {
  const { id } = params;

  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: headers(),
    });
    return <EditUser currentUser={data} />;
  } catch (error) {
    return <div>{error.message}</div>;
  }
};

export default page;
