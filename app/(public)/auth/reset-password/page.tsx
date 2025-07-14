import type { Metadata } from "next";
import { notFound } from "next/navigation";

// import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import InvalidRestPassword from "@/components/authentication/InvalidRestPassword";
import ResetPasswordPage from "@/components/authentication/resetPassword";
import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";

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
const IS_EMAIL_AND_TOKEN_VALID_MUTATION = `
  mutation IsEmailAndTokenValid($token: String!, $email: EmailAddress!) {
    isEmailAndTokenValid(token: $token, email: $email) {
      message
    }
  }
`;
const page = async (props: { searchParams: Promise<SearchParams> }) => {
  const searchParams = await props.searchParams;
  const token = searchParams.token || undefined;
  const email = searchParams.email || undefined;
  const error = searchParams.error || undefined;
  if (!token || !email) {
    notFound();
  }
  try {
    await api.post("/graphql", {
      query: IS_EMAIL_AND_TOKEN_VALID_MUTATION,
      variables: { token, email },
    });

    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <ResetPasswordPage email={email} token={token} error={error} />
      </div>
    );
  } catch (error: unknown) {
    const { message } = error as Error;
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <InvalidRestPassword email={email} message={message} />
      </div>
    );
    // throw new AppError(error.message, error.status);
  }
};

export default page;
