"use client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import BackupCodeInput from "./backupCodeInput";
import TotpInput from "./totpInput";

interface TwoFactorFormProps {
  onVerify: (code: string) => Promise<void>;
  onBackupVerify: (codes: string[]) => Promise<void>;
  // onResend: () => Promise<void>;
  back: () => void;
}

export const TwoFactorForm = ({
  onVerify,
  onBackupVerify,
  back,
  // onResend,
}: TwoFactorFormProps) => {
  const [view, setView] = useState<"totp" | "backup">("totp");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Two-Factor Authentication
      </h2>

      {view === "totp" ? (
        <TotpInput
          onVerify={async (code: string) => {
            setIsLoading(true);
            try {
              await onVerify(code);
            } catch (err) {
              setError("Invalid verification code");
            } finally {
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          error={error}
          // onResend={onResend}
          onSwitchToBackup={() => setView("backup")}
        />
      ) : (
        <BackupCodeInput
          onVerify={async (codes: string[]) => {
            setIsLoading(true);
            try {
              await onBackupVerify(codes);
            } catch (err) {
              setError("Invalid backup code");
            } finally {
              setIsLoading(false);
            }
          }}
          isLoading={isLoading}
          error={error}
          onSwitchToTotp={() => setView("totp")}
        />
      )}

      <div className="mt-4 text-center">
        <button
          onClick={() => back()}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          ← Return to login
        </button>
      </div>
    </div>
  );
};
