import EditUser from "@/components/(admin)/dashboard/users/editUser";
import api from "@/components/util/axios.api";
import { headers } from "next/headers";
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const {
      data: { data: user },
    } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: headers(),
    });

    return {
      title: `Edit User - ${user.name}`,
      description: `Edit the user ${user.name}. ${user.email}`,
      keywords: `admin, edit user, ${user.name}, ${user.email}`,
    };
  } catch (error) {
    return {
      title: "Edit User",
      description: "Edit user for the admin",
      keywords: "admin, edit user, admin edit user",
    };
  }
}
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
