"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Spinner from "../spinner/spinner";
import api from "../util/axios.api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false); // New state to toggle token input

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (hasToken && !token) {
      toast.error("Please enter your token");
      return;
    }

    if (!hasToken && !email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    const requestData = hasToken ? { token, email } : { email };

    const requestMethod = hasToken ? api.patch : api.post;

    try {
      await requestMethod("/auth/forgot-password", requestData);

      const successMessage = hasToken
        ? "Password reset token verified! Redirecting..."
        : "Password reset email sent! Please check your inbox.";

      toast.success(successMessage);
      setEmail("");
      setToken("");
      if (hasToken) {
        window.location.href = `/auth/reset-password?token=${token}`;
      }
    } catch (error) {
      toast.error(
        error?.message || error || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handlePasswordReset} className="space-y-4">
          {!hasToken ? (
            <div>
              <label className="block text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                placeholder="Enter Your Email Address"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ) : (
            <div>
              <label className="block text-gray-600">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter Your Email Address"
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <label className="block text-gray-600">Token</label>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                placeholder="Enter Your Token"
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner />
            ) : hasToken ? (
              "Submit Token"
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => setHasToken(!hasToken)}
            className="text-blue-500 hover:underline"
          >
            {hasToken
              ? "Don't have a token? Request reset link"
              : "Already have a token?"}
          </button>
        </div>

        <div className="text-center mt-4">
          <Link href="/auth" className="text-blue-500 hover:underline">
            Remembered your password? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
