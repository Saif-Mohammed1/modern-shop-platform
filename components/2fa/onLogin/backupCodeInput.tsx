// import {type FC, useState } from "react";
// interface BackupCodeInputProps {
//   onVerify: (code: string) => void;
//   isLoading: boolean;
//   error: string;
//   onSwitchToTotp: () => void;
// }
// const BackupCodeInput: FC<BackupCodeInputProps> = ({
//   onVerify,
//   isLoading,
//   error,
//   onSwitchToTotp,
// }) => {
//   const [backupCode, setBackupCode] = useState("");

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     const normalizedCode = backupCode.replace(/-/g, ""); //;
//     onVerify(normalizedCode);
//   };

//   return (
//     <form onSubmit={handleSubmit}>
//       <p className="text-sm text-gray-600 mb-4 text-center">
//         Enter one of your backup codes. Each code can only be used once.
//       </p>

//       <div className="mb-4">
//         <input
//           type="text"
//           value={backupCode}
//           onChange={(e) => setBackupCode(e.target.value)}
//           placeholder="XXXX-XXXX-XXXX-XXXX"
//           className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
//           disabled={isLoading}
//         />
//       </div>

//       {error && (
//         <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
//           {error}
//         </div>
//       )}

//       <button
//         type="submit"
//         disabled={isLoading || backupCode.length < 16}
//         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
//       >
//         {isLoading ? "Verifying..." : "Verify Backup Code"}
//       </button>

//       <div className="mt-4 text-center text-sm text-gray-600">
//         <button
//           onClick={onSwitchToTotp}
//           className="text-blue-600 hover:text-blue-700"
//         >
//           ← Return to regular 2FA
//         </button>
//       </div>
//     </form>
//   );
// };
// export default BackupCodeInput;
import { type FC, useState, useCallback, useRef } from "react";

interface BackupCodeInputProps {
  onVerify: (codes: string[]) => void;
  isLoading: boolean;
  error: string;
  onSwitchToTotp: () => void;
}

const BackupCodeInput: FC<BackupCodeInputProps> = ({
  onVerify,
  isLoading,
  error,
  onSwitchToTotp,
}) => {
  const [codes, setCodes] = useState<string[]>(Array(5).fill(""));
  const inputs = useRef<HTMLInputElement[]>([]);
  const formatCode = useCallback((value: string) => {
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "");
    return cleanValue.slice(0, 12).replace(/(\w{4})(?=\w)/g, "$1-");
  }, []);

  const handleCodeChange = (index: number, value: string) => {
    const formatted = formatCode(value);
    const newCodes = [...codes];
    newCodes[index] = formatted;
    setCodes(newCodes);
  };

  const validateCodes = useCallback(() => {
    return codes.every(
      (code) =>
        code.replace(/" "/g, "").length === 14 && /^[a-zA-Z0-9-]+$/.test(code)
    );
  }, [codes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCodes()) {
      return;
    }
    onVerify(codes);
  };
  const handleOnPaste = (
    index: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain").trim();

    // Split pasted codes, allow either newline or space separation
    const pastedCodes = pastedText.split(/\s+|\n/).slice(0, 5);

    // Create a new array from existing codes
    const newCodes = [...codes];

    // Fill the codes from the current index onwards
    for (let i = 0; i < pastedCodes.length; i++) {
      if (index + i < newCodes.length) {
        newCodes[index + i] = pastedCodes[i];
      }
    }

    setCodes(newCodes);

    // Move focus to the next empty input after pasting
    const nextIndex = index + pastedCodes.length;
    if (nextIndex < inputs.current.length) {
      inputs.current[nextIndex]?.focus();
    }

    // Automatically submit if all fields are filled
    if (newCodes.every((code) => code.trim() !== "")) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <p className="text-sm text-gray-600 mb-4 text-center">
        Enter 5 backup codes. Each code can only be used once.
      </p>

      <div className="space-y-3 mb-6">
        {codes.map((code, index) => (
          <div key={index}>
            <label className="block text-sm font-medium mb-1">
              Code {index + 1}
              <input
                type="text"
                value={code}
                ref={(el) => {
                  if (el) {
                    inputs.current[index] = el;
                  }
                }}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onPaste={(e) => handleOnPaste(index, e)}
                placeholder="XXXX-XXXX-XXXX"
                className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono mt-1"
                disabled={isLoading}
                maxLength={14}
              />
            </label>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-2.5 bg-red-100 text-red-700 rounded-md text-center text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !validateCodes()}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Verifying..." : "Verify Backup Codes"}
      </button>

      <div className="mt-4 text-center text-sm text-gray-600">
        <button
          type="button"
          onClick={onSwitchToTotp}
          className="text-blue-600 hover:text-blue-700 underline"
        >
          ← Return to regular 2FA
        </button>
      </div>
    </form>
  );
};

export default BackupCodeInput;
