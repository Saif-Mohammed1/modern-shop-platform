"use client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "../util/axios.api";

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");
  const router = useRouter();
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });
      const { error } = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important: Prevent automatic redirect on failure

        // redirect: callbackUrl ? true : false,
        // callbackUrl: callbackUrl || "/",
      });
      if (error) {
        throw new AppError(error.message, error.status);
      }
      router.push(callbackUrl || "/");

      toast.success("Account created successfully");
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error?.message ||
          error ||
          "an expected error happen please try again later"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Create Your Account
        </h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-600">Name</label>
            <input
              type="text"
              value={name}
              placeholder="Enter Your Name"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
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
          </div>
          <div>
            <label className="block text-gray-600">Password</label>
            <div className="flex  relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer text-gray-500"
              >
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-gray-600">Confirm Password</label>
            <div className="flex  relative items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="password"
                placeholder="Confirm Your Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer text-gray-500"
              >
                {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth" className="text-blue-500 hover:underline">
            Already have an account? Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
