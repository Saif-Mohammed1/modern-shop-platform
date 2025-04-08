import { useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";

import { lang } from "@/app/lib/utilities/lang";
import { accountTwoFactorTranslate } from "@/public/locales/client/(auth)/account/twoFactorTranslate";

import BackupCodesDisplay from "./backupCodesDisplay";

const RecoveryManagement = ({
  onRegenerate,
  onBack,
  generatedCodes,
}: {
  onRegenerate: () => Promise<void>;
  onBack: () => void;
  generatedCodes: string[];
}) => {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {accountTwoFactorTranslate[lang].RecoveryManagement.title}
        </h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <RiCloseCircleLine className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-sm text-yellow-700">
          {accountTwoFactorTranslate[lang].RecoveryManagement.description}
        </p>
      </div>

      {!confirm ? (
        <button
          onClick={() => {
            setConfirm(true);
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg"
        >
          {accountTwoFactorTranslate[lang].RecoveryManagement.generateText}
        </button>
      ) : generatedCodes.length ? (
        <BackupCodesDisplay
          codes={generatedCodes}
          onComplete={() => {
            setConfirm(false);
          }}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            {accountTwoFactorTranslate[lang].RecoveryManagement.confirmMessage}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onRegenerate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            >
              {accountTwoFactorTranslate[lang].RecoveryManagement.confirmText}
            </button>
            <button
              onClick={() => {
                setConfirm(false);
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
            >
              {accountTwoFactorTranslate[lang].RecoveryManagement.cancelText}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RecoveryManagement;
