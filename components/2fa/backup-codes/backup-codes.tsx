import api from "@/components/util/api";
import React, { useEffect, useState } from "react";

const BackupCodeManager: React.FC = () => {
  const [codes, setCodes] = useState<string[]>([]);
  const [showCodes, setShowCodes] = useState(false);
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const loadCodes = async () => {
      try {
        const response = await api.get("/auth/2fa/backup-codes");
        setRemaining(response.data.remaining);
        setCodes(response.data.codes);
      } catch (err) {
        console.error("Failed to load backup codes:", err);
      }
    };
    loadCodes();
  }, []);

  const handleRegenerate = async () => {
    if (
      !window.confirm(
        "Regenerating codes will invalidate all existing codes. Continue?"
      )
    )
      return;

    try {
      const response = await api.post("/auth/regenerate-backup-codes");
      setCodes(response.data.codes);
      setRemaining(response.data.remaining);
    } catch (err) {
      console.error("Regeneration failed:", err);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Backup Codes</h2>
        <span className="text-sm text-gray-600">
          {remaining} codes remaining
        </span>
      </div>

      <div className="mb-6">
        <button
          onClick={() => setShowCodes(!showCodes)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showCodes ? "Hide Codes" : "Show Codes"}
        </button>

        {showCodes && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {codes.map((code, index) => (
              <div
                key={index}
                className="p-2 bg-gray-100 rounded-md font-mono text-sm"
              >
                {code.match(/.{4}/g)?.join("-")}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <button
          onClick={handleRegenerate}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Generate New Backup Codes
        </button>
        <p className="text-xs text-gray-600 mt-2">
          ⚠️ This will invalidate all existing codes
        </p>
      </div>
    </div>
  );
};

export default BackupCodeManager;
