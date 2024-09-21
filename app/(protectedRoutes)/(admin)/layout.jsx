import SidebarV3 from "@/components/(admin)/dashboard/dashboardSideBar";
export const metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for the admin",
  keywords: "admin, admin dashboard, admin admin dashboard",
};
const layout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row ">
      <SidebarV3 />
      <div className="flex-1 p-2 sm:p-8">{children} </div>
    </div>
  );
};

export default layout;
