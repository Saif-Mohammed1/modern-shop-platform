"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    // Handle login logic here
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn("      credentials", {
        email,
        password,
        redirect: true,
        callbackUrl: "/",
      });

      if (error) {
        throw new AppError(error.message, error.status);
      }
      // //console.log("data", data);

      toast.success("Login success 👌");
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
          Login to Your Account
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Login"}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

const LoginPageV2 = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all fields");
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important: Prevent automatic redirect on failure

        // callbackUrl: callbackUrl || "/",
      });
      if (error) {
        throw new AppError(error.message, error.status);
      }
      toast.success("Login success 👌");
      setEmail("");
      setPassword("");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    } catch (error) {
      toast.error(
        error?.message ||
          error ||
          "An unexpected error occurred, please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Login to Your Account
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600">Email Address</label>
            <input
              type="email"
              placeholder="Enter Your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
            <div className="text-right mt-2">
              <Link
                href="/auth/forgot-password"
                className="text-blue-500 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : "Login"}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPageV2;
