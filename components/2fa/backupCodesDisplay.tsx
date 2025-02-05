import { RiShieldUserLine } from "react-icons/ri";

const BackupCodesDisplay = ({
  codes,
  onComplete,
}: {
  codes: string[];
  onComplete: () => void;
}) => (
  <div className="space-y-6">
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
      <div className="flex items-center gap-2 text-orange-600">
        <RiShieldUserLine className="w-5 h-5" />
        <p className="font-medium">Save these backup codes securely!</p>
      </div>
      <p className="text-sm text-orange-600 mt-2">
        These codes can be used to access your account if you lose access to
        your authenticator app.
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {codes.map((code, i) => (
        <div
          key={i}
          className="p-3 bg-gray-50 rounded-md text-center font-mono"
        >
          {code}
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => {
          const blob = new Blob([codes.join("\n")], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "backup-codes.txt";
          a.click();
        }}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
      >
        Download Codes
      </button>
      <button
        onClick={onComplete}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        Continue
      </button>
    </div>
  </div>
);
export default BackupCodesDisplay;
