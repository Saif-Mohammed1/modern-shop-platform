import AccountMenu from "@/components/customer/customerMaun";

const layout = async ({ children }) => {
  return (
    <div className="/bg-gray-100 min-h-screen p-1 flex flex-col sm:flex-row gap-3 max-w-[1200px] mx-auto ">
      <AccountMenu />
      {children}
    </div>
  );
  // }

  // // redirect("/auth");
};

export default layout;
