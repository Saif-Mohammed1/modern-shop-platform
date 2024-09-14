import ChangePassword from "@/components/customer/changePassword";
import api from "@/components/util/axios.api";

const page = async () => {
  try {
    const { data } = await api.get("/customer/device-info");
    const deviceInfo = data.data;
    return <ChangePassword devices={deviceInfo} />;
  } catch (error) {
    throw error;
  }
};

export default page;
