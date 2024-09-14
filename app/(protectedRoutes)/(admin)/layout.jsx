import SidebarV3 from "@/components/shop/adminDashboard/dashboardSideBar";
const layout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row ">
      <SidebarV3 />
      <div className="flex-1 p-8">{children} </div>
    </div>
  );
};

export default layout;
