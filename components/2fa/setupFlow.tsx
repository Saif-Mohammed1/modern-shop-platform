import Image from "next/image";
import { useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";

interface SetupFlowProps {
  setupData: { qrCode: string; manualEntryCode: string; backupCodes: string[] };
  onVerify: (token: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

const SetupFlow = ({
  setupData,
  onVerify,
  onBack,
  loading,
}: SetupFlowProps) => {
  const [token, setToken] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Set Up Authenticator App</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <RiCloseCircleLine className="w-5 h-5" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* QR Code Section */}
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded-lg">
            <Image
              src={setupData.qrCode}
              width={256}
              height={256}
              alt="QR Code"
              className="mx-auto"
            />
          </div>
          <p className="text-sm text-gray-600 text-center">
            Scan this QR code with your authenticator app
          </p>
        </div>

        {/* Manual Setup Section */}
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Manual Entry
            </p>
            <input
              type="text"
              value={setupData.manualEntryCode}
              readOnly
              className="w-full p-2 bg-white border rounded-md font-mono text-sm"
            />
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Enter the 6-digit code from your authenticator app
            </p>
            <input
              type="text"
              placeholder="123456"
              value={token}
              onChange={(e) =>
                setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full p-2.5 border rounded-lg text-center font-medium text-lg"
            />
            <button
              onClick={() => onVerify(token)}
              disabled={token.length !== 6 || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm & Enable"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SetupFlow;
