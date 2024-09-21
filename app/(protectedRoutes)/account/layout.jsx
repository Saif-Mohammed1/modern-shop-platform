import AccountMenu from "@/components/customer/customerMaun";
export const metadata = {
  title: "Account",
  description: "Account for the customer",
  keywords: "customer, account, customer account",
};
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
