import ForgotPasswordPage from "@/components/authentication/forgetPassword";
import OverlayWrapper from "@/components/util/OverlayWrapper";

function page() {
  // return <div>(.) interceptor auth...</div>;
  return (
    // <div className="fixed top-0 z-[9999] flex flex-1  bg-gray-700 bg-opacity-75 justify-center items-center">
    //   {/* <h1 className="text-3xl font-bold">Welcome to the LogIn Interceptor</h1> */}
    //   <div className="min-w-[300px]  rounded-lg">
    //     <LoginPage />
    //   </div>
    // </div>
    <OverlayWrapper>
      <ForgotPasswordPage />
    </OverlayWrapper>
  );
}

export default page;
