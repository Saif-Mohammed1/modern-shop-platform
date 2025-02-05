import { useState } from "react";
import { RiCloseCircleLine } from "react-icons/ri";
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
        <h2 className="text-lg font-semibold">Recovery Codes</h2>
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <RiCloseCircleLine className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
        <p className="text-sm text-yellow-700">
          Generating new backup codes will invalidate all previous codes. Make
          sure to save the new codes in a secure location.
        </p>
      </div>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg"
        >
          Generate New Codes
        </button>
      ) : generatedCodes.length ? (
        <BackupCodesDisplay
          codes={generatedCodes}
          onComplete={() => setConfirm(false)}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to generate new recovery codes?
          </p>
          <div className="flex gap-3">
            <button
              onClick={onRegenerate}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg"
            >
              Confirm Regenerate
            </button>
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default RecoveryManagement;
