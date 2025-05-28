"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";

import api_client from "@/app/lib/utilities/api.client";
import { lang } from "@/app/lib/utilities/lang";
import { forgetPasswordTranslate } from "@/public/locales/client/(public)/auth/forgetPasswordTranslate";

import Spinner from "../spinner/spinner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  // const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // const [hasToken, setHasToken] = useState(false); // New state to toggle token input

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
      const {
        data: { message },
      } = await api_client.post("/auth/forgot-password", {
        email,
      });

      toast.success(message);
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
  // const handlePasswordReset = async (e: FormEvent) => {
  //   e.preventDefault();

  //   if (hasToken && !token) {
  //     toast.error(
  //       forgetPasswordTranslate[lang].functions.handlePasswordReset.hasToken
  //         .error
  //     );
  //     return;
  //   }

  //   if (!hasToken && !email) {
  //     toast.error(
  //       forgetPasswordTranslate[lang].functions.handlePasswordReset.email.error
  //     );
  //     return;
  //   }

  //   setIsLoading(true);

  //   const requestData = hasToken ? { token, email } : { email };

  //   const requestMethod = hasToken ? api_client.patch : api_client.post;

  //   try {
  //     await requestMethod("/auth/forgot-password", requestData);

  //     const successMessage = hasToken
  //       ? forgetPasswordTranslate[lang].functions.handlePasswordReset
  //           .successMessage.token
  //       : forgetPasswordTranslate[lang].functions.handlePasswordReset
  //           .successMessage.email;

  //     toast.success(successMessage);
  //     setEmail("");
  //     setToken("");
  //     if (hasToken) {
  //       window.location.href = `/auth/reset-password?token=${token}`;
  //     }
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(
  //         error.message || forgetPasswordTranslate[lang].functions.errors.global
  //       );
  //     } else {
  //       toast.error(forgetPasswordTranslate[lang].functions.errors.global);
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
  // return (
  //   <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
  //     <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
  //       {forgetPasswordTranslate[lang].functions.form.title}
  //     </h2>

  //     <form onSubmit={handlePasswordReset} className="space-y-4">
  //       {  (
  //         <div>
  //           <label className="block text-gray-600">
  //             {forgetPasswordTranslate[lang].functions.form.email.label}
  //           </label>
  //           <input
  //             type="email"
  //             value={email}
  //             placeholder={
  //               forgetPasswordTranslate[lang].functions.form.email.placeholder
  //             }
  //             onChange={(e) => setEmail(e.target.value)}
  //             required
  //             className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  //           />
  //         </div>
  //       ) : (
  //         <div>
  //           <label className="block text-gray-600">
  //             {forgetPasswordTranslate[lang].functions.form.email.label}
  //           </label>
  //           <input
  //             type="email"
  //             value={email}
  //             onChange={(e) => setEmail(e.target.value)}
  //             required
  //             placeholder={
  //               forgetPasswordTranslate[lang].functions.form.email.placeholder
  //             }
  //             className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  //           />
  //           <label className="block text-gray-600">
  //             {forgetPasswordTranslate[lang].functions.form.token.label}
  //           </label>
  //           <input
  //             type="text"
  //             value={token}
  //             onChange={(e) => setToken(e.target.value)}
  //             required
  //             placeholder={
  //               forgetPasswordTranslate[lang].functions.form.token.placeholder
  //             }
  //             className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
  //           />
  //         </div>
  //       )}
  //       <button
  //         type="submit"
  //         className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
  //         disabled={isLoading}
  //       >
  //         {isLoading ? (
  //           <Spinner />
  //         ) : hasToken ? (
  //           forgetPasswordTranslate[lang].functions.form.submit.hasToken
  //         ) : (
  //           forgetPasswordTranslate[lang].functions.form.submit.email
  //         )}
  //       </button>
  //     </form>

  //     <div className="text-center mt-4">
  //       <button
  //         onClick={() => setHasToken(!hasToken)}
  //         className="text-blue-500 hover:underline"
  //       >
  //         {hasToken
  //           ? forgetPasswordTranslate[lang].functions.form.toggle.hasToken
  //               .requestResetLink
  //           : forgetPasswordTranslate[lang].functions.form.toggle.email
  //               .alreadyHaveToken}
  //       </button>
  //     </div>

  //     <div className="text-center mt-4">
  //       <Link href="/auth" className="text-blue-500 hover:underline">
  //         {forgetPasswordTranslate[lang].functions.form.toggle.rememberPassword}
  //       </Link>
  //     </div>
  //   </div>
  // );
};

export default ForgotPasswordPage;
