"use client";

import { gql, useMutation } from "@apollo/client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { type FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

import { lang } from "@/app/lib/utilities/lang";
import { loginTranslate } from "@/public/locales/client/(public)/auth/loginTranslate";
import { authControllerTranslate } from "@/public/locales/server/authControllerTranslate";

import { TwoFactorForm } from "../2fa/onLogin/twoFactorForm";
import { useCartHook } from "../providers/store/cart/useCartHook";
import Spinner from "../spinner/spinner";

const VALIDATE_BACKUP_CODES = gql`
  mutation ValidateBackupCodes($input: ValidateBackupCodesInput!) {
    validateBackupCodes(input: $input) {
      success
      message
      data {
        access_token
        user {
          _id
          name
          email
        }
      }
    }
  }
`;

interface ValidateBackUpResponse {
  validateBackupCodes: {
    success: boolean;
    message: string;
    data: {
      access_token: string;
      user: {
        _id: string;
        name: string;
        email: string;
      };
    };
  };
}
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2fa, setIsLoading2fa] = useState(false);
  const [error, setError] = useState("");
  const [requiredTwoFactor, setRequiredTwoFactor] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const { mergeLocalCartWithDB } = useCartHook();
  const callbackUrl = params.get("callbackUrl");

  const [validateBackupCodes] = useMutation<ValidateBackUpResponse>(
    VALIDATE_BACKUP_CODES,
    {
      onCompleted: (data) => {
        const message = data?.validateBackupCodes?.message;
        toast.success(
          message || loginTranslate[lang].functions.handelBackup2fa.success
        );

        // Handle successful backup code validation
        if (callbackUrl) {
          router.back(); // Go back to previous page (closes modal)
          router.push(callbackUrl);
        } else {
          router.back(); // Go back to previous page (closes modal)
          router.push("/");
        }
      },
      onError: (error) => {
        const message = error.message || loginTranslate[lang].errors.global;
        setError(message);
        toast.error(message);
      },
    }
  );

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
    setIsLoading2fa(true);
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
      if (callbackUrl) {
        router.back(); // Go back to previous page (closes modal)

        router.push(callbackUrl);
      } else {
        router.back(); // Go back to previous page (closes modal)
        router.push("/");
      }
    } catch (error: unknown) {
      const message =
        (error as Error)?.message || loginTranslate[lang].errors.global;
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading2fa(false);
    }
  };

  const handleBackupVerify = async (codes: string[]) => {
    setIsLoading2fa(true);
    try {
      await validateBackupCodes({
        variables: {
          input: {
            email,
            codes,
          },
        },
      });
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    } finally {
      setIsLoading2fa(false);
    }
  };
  return (
    <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      {requiredTwoFactor ? (
        <TwoFactorForm
          onVerify={handleTotpVerify}
          error={error}
          isLoading={isLoading2fa}
          onBackupVerify={handleBackupVerify}
          // onResend={handleResend}
          back={() => {
            setRequiredTwoFactor(false);
          }}
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
                onChange={(e) => {
                  setEmail(e.target.value.trim());
                }}
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
                  onChange={(e) => {
                    setPassword(e.target.value.trim());
                  }}
                  className="w-full px-4 py-2 mt-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer text-gray-500"
                >
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </button>
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

          {/* <div className="text-center mt-4">
            <Link
              href="/auth/terms"
              className="text-blue-500 hover:underline"
            >
              {loginTranslate[lang].form.terms}
            </Link>
          </div> */}
          <div className="text-center mt-4 flex flex-col justify-center">
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
