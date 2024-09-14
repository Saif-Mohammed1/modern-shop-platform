"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import api from "../util/axios.api";

const ResetPasswordPage = () => {
  // const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get("token");

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    // Check if both passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!token || !newPassword) {
      toast.error("Please fill all fields");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset successfully!");
      setNewPassword("");
      setConfirmPassword("");
      router.push("/auth"); // Redirect to login page after successful reset
    } catch (error) {
      toast.error(error?.message || error || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Reset Your Password
        </h2>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-gray-600">Token</label>
            <input
              type="text"
              value={token}
              disabled
              // onChange={(e) => setToken(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">New Password</label>
            <input
              type="password"
              value={newPassword}
              placeholder="Enter Your New Password"
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              placeholder="Confirm Your New Password"
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
            {isLoading ? <Spinner /> : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
