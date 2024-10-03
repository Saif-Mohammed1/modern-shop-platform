"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { loginTranslate } from "@/app/_translate/auth/loginTranslate";
import { lang } from "../util/lang";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(loginTranslate[lang].functions.handleLogin.requiredFields);
      return;
    }
    setIsLoading(true);
    try {
      // const { error } =
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Important: Prevent automatic redirect on failure

        // callbackUrl: callbackUrl || "/",
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success(loginTranslate[lang].functions.handleLogin.success);
      setEmail("");
      setPassword("");
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push("/");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || loginTranslate[lang].errors.global);
      } else {
        toast.error(loginTranslate[lang].errors.global);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          {loginTranslate[lang].form.title}
        </h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-600">
              {loginTranslate[lang].form.email.label}
            </label>
            <input
              type="email"
              placeholder={loginTranslate[lang].form.email.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-600">
              {loginTranslate[lang].form.password.label}
            </label>
            <div className="flex  relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={loginTranslate[lang].form.password.placeholder}
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
                {loginTranslate[lang].form.forgotPassword}
              </Link>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : loginTranslate[lang].form.login}
          </button>
        </form>
        <div className="text-center mt-4">
          <Link href="/auth/register" className="text-blue-500 hover:underline">
            {loginTranslate[lang].form.signUp}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
