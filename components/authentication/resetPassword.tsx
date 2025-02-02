"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import api from "../util/api";
import { resetPasswordTranslate } from "@/app/_translate/auth/resetPasswordTranslate";
import { lang } from "../util/lang";

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();

    // Check if both passwords match
    if (newPassword !== confirmPassword) {
      toast.error(
        resetPasswordTranslate[lang].functions.handlePasswordReset
          .passwordsDoNotMatch
      );
      return;
    }

    if (!token || !newPassword) {
      toast.error(
        resetPasswordTranslate[lang].functions.handlePasswordReset.fillAllFields
      );
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      toast.success(
        resetPasswordTranslate[lang].functions.handlePasswordReset
          .successMessage
      );
      setNewPassword("");
      setConfirmPassword("");
      router.push("/auth"); // Redirect to login page after successful reset
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            resetPasswordTranslate[lang].functions.handlePasswordReset
              .unexpectedError
        );
      } else {
        toast.error(resetPasswordTranslate[lang].errors.global);
      }
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (params.has("token")) {
      setToken(params.get("token") ?? "");
    }
  }, [params]);
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        {resetPasswordTranslate[lang].form.title}
      </h2>
      <form onSubmit={handlePasswordReset} className="space-y-4">
        <div>
          <label className="block text-gray-600">
            {resetPasswordTranslate[lang].form.token.label}
          </label>
          <input
            type="text"
            value={token}
            disabled
            placeholder={resetPasswordTranslate[lang].form.token.placeholder}
            // onChange={(e) => setToken(e.target.value)}
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600">
            {resetPasswordTranslate[lang].form.newPassword.label}
          </label>
          <input
            type="password"
            value={newPassword}
            placeholder={
              resetPasswordTranslate[lang].form.newPassword.placeholder
            }
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600">
            {resetPasswordTranslate[lang].form.confirmPassword.label}
          </label>
          <input
            type="password"
            value={confirmPassword}
            placeholder={
              resetPasswordTranslate[lang].form.confirmPassword.placeholder
            }
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            resetPasswordTranslate[lang].form.submitButton
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordPage;
