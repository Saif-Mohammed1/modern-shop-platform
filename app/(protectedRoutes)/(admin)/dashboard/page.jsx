import Dashboard from "@/components/shop/adminDashboard/dashboard";
import api from "@/components/util/axios.api";

const page = async () => {
  try {
    const {
      data: { data },
    } = await api.get("/admin/dashboard");
    return <Dashboard data={data} />;
  } catch (error) {
    return <p>No data available.</p>;
  }
};

export default page;
