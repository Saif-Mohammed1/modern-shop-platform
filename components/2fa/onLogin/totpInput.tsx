import { FC, useRef, useState } from "react";
interface TotpInputProps {
  onVerify: (code: string) => void;
  isLoading: boolean;
  error: string;
  // onResend: () => void;
  onSwitchToBackup: () => void;
}
const TotpInput: FC<TotpInputProps> = ({
  onVerify,
  isLoading,
  error,
  // onResend,
  onSwitchToBackup,
}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (newCode.every((c) => c !== "")) {
      handleSubmit(newCode.join(""));
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newCode = pastedData.split("").slice(0, 6);
      setCode(newCode);
      onVerify(newCode.join(""));
    }
  };

  const handleSubmit = (finalCode?: string) => {
    onVerify(finalCode || code.join(""));
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
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Enter the 6-digit code from your authenticator app
      </p>

      <div className="flex justify-center gap-2 mb-6">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onPaste={handlePaste}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-12 text-2xl text-center border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isLoading}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-center">
          {error}
        </div>
      )}

      <button
        onClick={() => handleSubmit()}
        disabled={isLoading || code.some((c) => c === "")}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg disabled:opacity-50"
      >
        {isLoading ? "Verifying..." : "Verify Code"}
      </button>

      <div className="mt-4 text-center space-y-2">
        {/* <button
          onClick={onResend}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Resend Code
        </button> */}
        <div className="text-sm text-gray-600">
          Lost access?{" "}
          <button
            onClick={onSwitchToBackup}
            className="text-blue-600 hover:text-blue-700"
          >
            Use backup code
          </button>
        </div>
      </div>
    </div>
  );
};
export default TotpInput;
