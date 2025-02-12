"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { lang } from "../../app/lib/util/lang";
import { verifyEmailPasswordTranslate } from "@/app/_translate/(public)/auth/verifyEmailPasswordTranslate copy";

const EmailVerificationPage = () => {
  const [isSending, setIsSending] = useState(false);

  const handleResendVerification = async () => {
    setIsSending(true);
    try {
      //   await sendEmailVerification();
      toast.success(
        verifyEmailPasswordTranslate[lang].functions.handleResendVerification
          .successMessage
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          verifyEmailPasswordTranslate[lang].functions.handleResendVerification
            .errorMessage
        );
      } else {
        toast.error(
          verifyEmailPasswordTranslate[lang].functions.handleResendVerification
            .errorMessage
        );
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Verify Your Email Address
        </h2>
        <p className="text-gray-600 mb-4">
          We have sent an email to your inbox with a verification link. Please
          click the link to verify your email address.
        </p>
        <button
          onClick={handleResendVerification}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isSending}
        >
          {isSending ? (
            <div className="flex justify-center">
              <div className="spinner-border animate-spin inline-block w-4 h-4 border-2 rounded-full"></div>
            </div>
          ) : (
            "Resend Verification Email"
          )}
        </button>
        <div className="text-center mt-4">
          <Link href="/auth/login" className="text-blue-500 hover:underline">
            Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
