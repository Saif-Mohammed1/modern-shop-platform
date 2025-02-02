import React, { useState } from "react";
import { useRouter } from "next/router";
import api from "@/components/util/api";

const BackupCodeVerification: React.FC = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post("/auth/verify-backup-code", {
        code: code.replace(/-/g, ""),
      });

      if (response.data.sessionToken) {
        // Store session token and redirect
        localStorage.setItem("session", response.data.sessionToken);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Use Backup Code</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Backup Code
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              pattern="[A-Z0-9-]{16,19}"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              className="w-full p-2 mt-1 border rounded-md"
              required
            />
          </label>
          <p className="text-sm text-gray-600 mt-1">
            Format: 16-digit code with optional hyphens
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2 text-red-600 bg-red-100 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p>⚠️ Each backup code can only be used once</p>
        <p>🔒 After use, this code will be permanently deleted</p>
      </div>
    </div>
  );
};

export default BackupCodeVerification;
