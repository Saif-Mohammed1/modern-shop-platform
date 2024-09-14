import AccountMenu from "@/components/customer/customerMaun";

const layout = ({ children }) => {
  return (
    <div className="bg-gray-100 min-h-screen p-1 flex gap-3">
      <AccountMenu />

      {children}
    </div>
  );
};

export default layout;
