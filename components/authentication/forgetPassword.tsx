"use client";
import { gql, useMutation } from "@apollo/client";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

import { lang } from "@/app/lib/utilities/lang";
import { forgetPasswordTranslate } from "@/public/locales/client/(public)/auth/forgetPasswordTranslate";

import Spinner from "../spinner/spinner";

interface ForgotPasswordResponse {
  forgotPassword: {
    message: string;
  };
}

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: EmailAddress!) {
    forgotPassword(email: $email) {
      message
    }
  }
`;
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  // const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [hasToken, setHasToken] = useState(false); // New state to toggle token input
  const [forgotPassword] = useMutation<ForgotPasswordResponse>(
    FORGOT_PASSWORD_MUTATION
  );
  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(
        forgetPasswordTranslate[lang].functions.handlePasswordReset.email.error
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data } = await forgotPassword({ variables: { email } });

      if (data?.forgotPassword?.message) {
        toast.success(data.forgotPassword.message);
      }
      setEmail("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message || forgetPasswordTranslate[lang].functions.errors.global
        );
      } else {
        toast.error(forgetPasswordTranslate[lang].functions.errors.global);
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {forgetPasswordTranslate[lang].functions.form.title}
      </h2>

      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label className="block text-gray-600">
            {forgetPasswordTranslate[lang].functions.form.email.label}
          </label>
          <input
            type="email"
            value={email}
            placeholder={
              forgetPasswordTranslate[lang].functions.form.email.placeholder
            }
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <Spinner />
          ) : (
            forgetPasswordTranslate[lang].functions.form.submit.email
          )}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link href="/auth" className="text-blue-500 hover:underline">
          {forgetPasswordTranslate[lang].functions.form.toggle.rememberPassword}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
