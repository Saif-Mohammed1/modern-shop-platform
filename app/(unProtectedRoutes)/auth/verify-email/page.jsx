import EmailVerificationPage from "@/components/authentication/emailVerification";

export const metadata = {
  title: "Verify Email - My Awesome Shop",
  description:
    "Verify your email address to complete your registration at My Awesome Shop. Enjoy a seamless shopping experience with us!",
};

function page() {
  return <EmailVerificationPage />;
}

export default page;
