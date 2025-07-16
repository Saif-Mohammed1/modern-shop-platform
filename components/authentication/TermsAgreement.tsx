"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, type Control } from "react-hook-form";
import {
  FiCheck,
  FiExternalLink,
  FiInfo,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";

import { lang } from "@/app/lib/utilities/lang";
import { registerTranslate } from "@/public/locales/client/(public)/auth/registerTranslate";

interface TermsAgreementProps {
  control: Control<any>;
  error?: string;
  name: string;
}

const TermsAgreement: React.FC<TermsAgreementProps> = ({
  control,
  error,
  name,
}) => {
  const [showTermsDetails, setShowTermsDetails] = useState(false);
  const translate = registerTranslate[lang].form.terms;

  const toggleDetails = () => setShowTermsDetails(!showTermsDetails);

  // Localized UI text
  const uiText = {
    en: {
      hideDetails: "Hide details",
      showDetails: "Show details",
      whatAgreeing: "What you're agreeing to:",
      keyPoints: "Key points:",
      keyPointsList: [
        "We protect your personal information",
        "You can opt out of marketing emails anytime",
        "Your data is used only to improve your experience",
        "We never sell your information to third parties",
      ],
      viewFullTerms: "View full Terms of Service",
      viewFullPrivacy: "View full Privacy Policy",
    },
    uk: {
      hideDetails: "Приховати деталі",
      showDetails: "Показати деталі",
      whatAgreeing: "З чим ви погоджуєтеся:",
      keyPoints: "Ключові моменти:",
      keyPointsList: [
        "Ми захищаємо вашу особисту інформацію",
        "Ви можете відмовитися від маркетингових листів будь-коли",
        "Ваші дані використовуються лише для покращення досвіду",
        "Ми ніколи не продаємо вашу інформацію третім особам",
      ],
      viewFullTerms: "Переглянути повні Умови надання послуг",
      viewFullPrivacy: "Переглянути повну Політику конфіденційності",
    },
  };

  const currentUiText = uiText[lang as keyof typeof uiText];

  return (
    <div className="space-y-3">
      {/* Terms Agreement Checkbox */}
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value } }) => (
          <div className="flex items-start space-x-3 group">
            <div className="flex items-center h-5 pt-0.5">
              <div className="relative">
                <input
                  type="checkbox"
                  id="terms-agreement"
                  checked={value || false}
                  onChange={(e) => onChange(e.target.checked)}
                  className="sr-only"
                  aria-describedby={error ? "terms-error" : undefined}
                />
                <label
                  htmlFor="terms-agreement"
                  className={`
                    flex items-center justify-center w-5 h-5 border-2 rounded cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
                    ${
                      value
                        ? "bg-blue-500 border-blue-500 text-white shadow-sm"
                        : "border-gray-300 hover:border-blue-400 bg-white"
                    }
                    ${error ? "border-red-500 hover:border-red-600" : ""}
                    group-hover:scale-105
                  `}
                >
                  {Boolean(value) && (
                    <FiCheck className="w-3 h-3 transition-transform duration-200 scale-100" />
                  )}
                </label>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <label
                htmlFor="terms-agreement"
                className="text-sm text-gray-700 cursor-pointer leading-5 select-none"
              >
                <span className="font-medium">{translate.agreement}</span>{" "}
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {translate.termsOfService}
                  <FiExternalLink className="w-3 h-3" />
                </Link>{" "}
                <span className="text-gray-600">{translate.and}</span>{" "}
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium transition-colors duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  {translate.privacyPolicy}
                  <FiExternalLink className="w-3 h-3" />
                </Link>
              </label>
            </div>
          </div>
        )}
      />

      {/* Error Message */}
      {Boolean(error) && (
        <div
          id="terms-error"
          className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3 animate-shake"
          role="alert"
          aria-live="polite"
        >
          <FiInfo className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Show/Hide Terms Details Toggle */}
      <div className="pl-8">
        <button
          type="button"
          onClick={toggleDetails}
          className="text-xs text-gray-500 hover:text-gray-700 inline-flex items-center gap-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded px-1 py-0.5"
          aria-expanded={showTermsDetails}
          aria-controls="terms-details"
        >
          {showTermsDetails ? (
            <>
              {currentUiText.hideDetails} <FiChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              {currentUiText.showDetails} <FiChevronDown className="w-3 h-3" />
            </>
          )}
        </button>
      </div>

      {/* Terms Details Collapsible */}
      <div
        id="terms-details"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showTermsDetails ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-8 pr-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiInfo className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800 mb-2">
                  {currentUiText.whatAgreeing}
                </h4>
                <div className="text-xs text-gray-600 leading-relaxed space-y-2">
                  <p>{translate.fullText}</p>

                  <div className="bg-white bg-opacity-60 rounded-md p-3 border border-blue-200">
                    <h5 className="text-xs font-medium text-gray-700 mb-1">
                      {currentUiText.keyPoints}
                    </h5>
                    <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                      {currentUiText.keyPointsList.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-3 border-t border-blue-200">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <Link
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors duration-200 py-1"
                >
                  <FiExternalLink className="w-3 h-3" />
                  {currentUiText.viewFullTerms}
                </Link>
                <Link
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 transition-colors duration-200 py-1"
                >
                  <FiExternalLink className="w-3 h-3" />
                  {currentUiText.viewFullPrivacy}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAgreement;
