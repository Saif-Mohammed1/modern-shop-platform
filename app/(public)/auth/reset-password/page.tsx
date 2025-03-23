import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";
import ResetPasswordPage from "@/components/authentication/resetPassword";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
// import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/app/lib/utilities/api";
import InvalidRestPassword from "@/components/authentication/InvalidRestPassword";

export const metadata: Metadata = {
  title: resetPasswordTranslate[lang].metadata.title,
  description: resetPasswordTranslate[lang].metadata.description,
  keywords: resetPasswordTranslate[lang].metadata.keywords,
};
type SearchParams = {
  token: string;
  email: string;
  error: string;
};
const page = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const token = searchParams.token || undefined;
  const email = searchParams.email || undefined;
  const error = searchParams.error || undefined;
  if (!token || !email) notFound();
  try {
    await api.get(`/auth/reset-password/?token=${token}&email=${email}`);

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <ResetPasswordPage email={email} token={token} error={error} />
      </div>
    );
  } catch (error: any) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <InvalidRestPassword email={email} message={error.message} />
      </div>
    );
    // throw new AppError(error.message, error.status);
  }
};

export default page;
