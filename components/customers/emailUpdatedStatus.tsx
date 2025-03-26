import { emailUpdatedStatusTranslate } from "@/public/locales/client/(public)/emailUpdatedStatusTranslate";
import { lang } from "@/app/lib/utilities/lang";
import type { FC } from "react";
import "./emailUpdatedStatus.css";

type Props = {
  error?: string;
  message?: string;
};

const ConfirmEmailChange: FC<Props> = ({ error, message }) => {
  const isSuccess = message?.includes("successfully");
  const isWarning = message?.includes("check your email"); // For pending confirmation messages

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div
        className={`max-w-md mx-auto rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-out ${
          error || isWarning ? "animate-float" : ""
        }`}
      >
        <div
          className={`p-8 space-y-6 ${
            error ? "bg-red-50" : isSuccess ? "bg-green-50" : "bg-blue-50"
          }`}
        >
          <div className="flex items-center justify-center">
            <div
              className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                error
                  ? "bg-red-100"
                  : isSuccess
                    ? "bg-green-100"
                    : "bg-blue-100"
              }`}
            >
              {error ? (
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : isSuccess ? (
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div className="text-center space-y-2">
            <h2
              className={`text-xl font-semibold ${
                error
                  ? "text-red-800"
                  : isSuccess
                    ? "text-green-800"
                    : "text-blue-800"
              }`}
            >
              {error
                ? emailUpdatedStatusTranslate[lang].functions.onFail
                : isSuccess
                  ? emailUpdatedStatusTranslate[lang].functions.onSuccess
                  : emailUpdatedStatusTranslate[lang].functions.onPending}
            </h2>

            <p
              className={`text-sm ${
                error
                  ? "text-red-700"
                  : isSuccess
                    ? "text-green-700"
                    : "text-blue-700"
              }`}
            >
              {error || message}
            </p>
          </div>

          {!error && !isSuccess && (
            <div className="mt-6 text-center">
              <div className="animate-pulse text-xs text-blue-500">
                {emailUpdatedStatusTranslate[lang].functions.redirectNotice}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmailChange;
