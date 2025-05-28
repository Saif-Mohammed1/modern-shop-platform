"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

import api_client from "@/app/lib/utilities/api.client";
import { lang } from "@/app/lib/utilities/lang";
import { VerifyEmailTranslate } from "@/public/locales/client/(auth)/VerifyEmail.Translate";

import Input from "./Input";
import SubmitButton from "./SubmitButton";

const VerifyEmail = () => {
  // const [code, setCode] = useState<string[]>([..." ".repeat(8)]);// not work
  const [code, setCode] = useState<string[]>(Array(8).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const { data: session, update } = useSession();
  const router = useRouter();
  const handleChange = (index: number, value: string) => {
    // if (!/^[a-zA-Z0-9]{8}$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text/plain")
      .slice(0, code.length);

    if (/^[a-zA-Z0-9]+$/.test(pastedData)) {
      // Allow alphanumeric
      const pastedArray = pastedData.split("").slice(0, code.length);
      const newCode = Array.from({ length: code.length }, (_, i) =>
        i < pastedArray.length ? pastedArray[i] : ""
      );

      setCode(newCode);

      // Focus management
      const nextFocusIndex = Math.min(pastedArray.length, code.length - 1);
      setTimeout(() => {
        inputs.current[nextFocusIndex]?.focus();
      }, 0); // Small timeout to ensure state update
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    if (!session?.user) {
      throw new Error(VerifyEmailTranslate[lang].VerifyEmail.userNotFound);
    }
    e.preventDefault();

    try {
      const {
        data: { message },
      } = await api_client.put("/customers/update-data/verify-email", {
        code: code.join(""),
      });
      await update({
        ...session,
        user: {
          ...session?.user,

          verification: {
            ...session?.user.verification,
            email_verified: true,
          },
        },
      });
      toast.success(message || VerifyEmailTranslate[lang].VerifyEmail.success);
      router.push("/");
    } catch (error) {
      toast.error(
        (error as Error)?.message || VerifyEmailTranslate[lang].VerifyEmail.fail
      );
    }
  };
  // handel key backspace or delete to remove the value
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      const newCode = [...code];

      if (newCode[index] === "") {
        // Delete previous field if current is empty
        if (index > 0) {
          newCode[index - 1] = "";
          inputs.current[index - 1]?.focus();
        }
      } else {
        // Clear current field but keep focus
        newCode[index] = "";
        inputs.current[index]?.focus();
      }

      setCode(newCode);
    }
  };
  const onResend = async (): Promise<void> => {
    try {
      await api_client.get("/customers/update-data/verify-email");
      toast.success(VerifyEmailTranslate[lang].VerifyEmail.resendCodeSuccess);
    } catch (error) {
      toast.error(
        (error as Error)?.message ||
          VerifyEmailTranslate[lang].VerifyEmail.resendCodeFail
      );
    }
  };
  return (
    <div className="space-y-4 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-2xl font-semibold text-center">
        {VerifyEmailTranslate[lang].VerifyEmail.VerifyEmail}
      </h1>
      <p className="text-sm text-gray-600 mb-4 text-center">
        {VerifyEmailTranslate[lang].VerifyEmail.EnterCode(code.length)}
      </p>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center gap-2 mb-6"
      >
        <div className="flex justify-center gap-2 mb-6">
          {code.map((digit, index) => (
            <Input
              key={index}
              ref={(el) => {
                inputs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => {
                handleChange(index, e.target.value);
              }}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                handleKeyDown(index, e);
              }}
              className="w-12 h-12 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              // disabled={isLoading}
            />
          ))}
        </div>
        <SubmitButton
          title={VerifyEmailTranslate[lang].VerifyEmail.VerifyCode}
          // onClick={() => handleSubmit()}
          disabled={code.some((c) => c === "")}
          className="#verifyCode w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
        ></SubmitButton>
      </form>

      {/* {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )} */}

      <div className="mt-4 text-center space-y-2">
        <button
          onClick={onResend}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {VerifyEmailTranslate[lang].VerifyEmail.ResendCode}
        </button>
      </div>
    </div>
  );
};
export default VerifyEmail;
