"use client";
import { type FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Spinner from "../spinner/spinner";
import { useRouter, useSearchParams } from "next/navigation";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { loginTranslate } from "@/public/locales/client/(public)/auth/loginTranslate";
import { lang } from "../../app/lib/utilities/lang";
import { TwoFactorForm } from "../2fa/onLogin/twoFactorForm";
import api from "../../app/lib/utilities/api";
import { mergeLocalCartWithDB } from "../providers/context/cart/cartAction";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [requiredTwoFactor, setRequiredTwoFactor] = useState(false);
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
        if (
          result.error ===
          authControllerTranslate[lang].functions.logIn.twoFactorRequired
        ) {
          setRequiredTwoFactor(true);
          // throw new Error(result.error);
          return;
        }
        throw new Error(result.error);
      }
      toast.success(loginTranslate[lang].functions.handleLogin.success);
      setEmail("");
      setPassword("");
      const res = await mergeLocalCartWithDB();
      if (res?.message) {
        toast.success(res.message);
      }
      if (callbackUrl) {
        router.back(); // Go back to previous page (closes modal)

        router.push(callbackUrl);
      } else {
        router.back(); // Go back to previous page (closes modal)
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
  const handleTotpVerify = async (code: string) => {
    // setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        // password,
        code,
        redirect: false,
      });
      if (result?.error) {
        throw new Error(result.error);
      }
      toast.success(loginTranslate[lang].functions.handelVerify2fa.success);
      router.back(); // Go back to previous page (closes modal)

      router.push("/");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || loginTranslate[lang].errors.global);
      } else {
        toast.error(loginTranslate[lang].errors.global);
      }
    }
  };

  const handleBackupVerify = async (codes: string[]) => {
    // setIsLoading(true);
    try {
      ///auth/2fa/backup/validate

      const { data } = await api.post("/auth/2fa/backup/validate", {
        email,
        codes,
      });

      toast.success(
        data.message || loginTranslate[lang].functions.handelBackup2fa.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || loginTranslate[lang].errors.global);
      } else {
        toast.error(loginTranslate[lang].errors.global);
      }
    }
  };
  // const handleResend = async () => {
  //   // setIsLoading(true);
  //   try {
  //     await api.put("/auth/2fa", {
  //       email,
  //     });

  //     toast.success(loginTranslate[lang].functions.handelResend2fa.success);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       toast.error(error.message || loginTranslate[lang].errors.global);
  //     } else {
  //       toast.error(loginTranslate[lang].errors.global);
  //     }
  //   }
  // };
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      {requiredTwoFactor ? (
        <TwoFactorForm
          onVerify={handleTotpVerify}
          onBackupVerify={handleBackupVerify}
          // onResend={handleResend}
          back={() => setRequiredTwoFactor(false)}
        />
      ) : (
        <>
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
              className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? <Spinner /> : loginTranslate[lang].form.login}
            </button>
          </form>
          <div className="text-center mt-4">
            <Link
              href="/auth/register"
              className="text-blue-500 hover:underline"
            >
              {loginTranslate[lang].form.signUp}
            </Link>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-500">
              {loginTranslate[lang].functions.handleLogin.termsAgreement}
            </p>
          </div>
          {/* <div className="text-center mt-4">
            <Link
              href="/auth/terms"
              className="text-blue-500 hover:underline"
            >
              {loginTranslate[lang].form.terms}
            </Link>
          </div> */}
          <div className="text-center mt-4 flex flex-col justify-center">
            <p className="text-gray-500">use this email for testing website</p>
            <p className="text-gray-500 font-bold">
              email: moderator@gmail.com
            </p>
            <p className="text-gray-500 font-bold">
              password: Pa@password12345
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default LoginPage;
