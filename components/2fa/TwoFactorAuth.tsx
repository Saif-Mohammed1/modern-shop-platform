"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { RiShieldUserLine } from "react-icons/ri";

import api from "../util/api";
import SetupFlow from "./setupFlow";
import BackupCodesDisplay from "./backupCodesDisplay";
import SecurityDashboard from "./securityDashboard";
import RecoveryManagement from "./recoveryManagement";
import AuditLogViewer from "./auditLogViewer";
interface SecurityMetadata {
  ipAddress: string;
  userAgent: string;
  location?: string;
  deviceHash: string;
}
interface AuditLog {
  timestamp: Date;
  action: string;
  metadata: SecurityMetadata;
}
const TwoFactorAuthDashboard = () => {
  const { data: session, update } = useSession();
  const [view, setView] = useState<
    "main" | "setup" | "verify" | "backup" | "recovery" | "audit"
  >("main");
  const [setupData, setSetupData] = useState<{
    qrCode: string;
    manualEntryCode: string;
    backupCodes: string[];
  }>();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  // Main 2FA Status Management
  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/auth/2fa");
      setSetupData(data);
      setView("setup");
      toast.success("2FA setup initiated");
    } catch (error: any) {
      toast.error(error?.message || "2FA setup failed");
    } finally {
      setLoading(false);
    }
  };

  const verify2FAToken = async (token: string) => {
    try {
      setLoading(true);
      await api.post("/auth/2fa/verify", { token });

      setView("backup");
      toast.success("2FA enabled successfully!");
    } catch (error: any) {
      toast.error(error?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await api.post("/auth/2fa/disable");
      await update({
        ...session,
        user: { ...session?.user, isTwoFactorAuthEnabled: false },
      });
      setView("main");
      toast.success("2FA disabled successfully");
    } catch (error: any) {
      toast.error(error?.message || "Disable failed");
    } finally {
      setLoading(false);
    }
  };

  // Backup Codes Management
  const verifyBackupCode = async (code: string) => {
    try {
      await api.post("/auth/2fa/backup/verify", { code });
      toast.success("Backup code verified!");
    } catch (error: any) {
      toast.error(error?.message || "Invalid backup code");
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      const { data } = await api.post("/auth/2fa/recovery");
      setSetupData((prev) => ({ ...prev!, backupCodes: data.newCodes }));
      setGeneratedCodes(data.newCodes);
      toast.success("New backup codes generated!");
    } catch (error: any) {
      toast.error(error?.message || "Regeneration failed");
    }
  };

  // Audit Logs
  const loadAuditLogs = async () => {
    try {
      const { data } = await api.get("/auth/2fa/audit");
      setAuditLogs(data.logs);
    } catch (error: any) {
      toast.error("Failed to load audit logs");
    }
  };
  const onComplete = async () => {
    setView("main");
    await update({
      ...session,
      user: { ...session?.user, isTwoFactorAuthEnabled: true },
    });
    toast.success("2FA enabled successfully!");
  };
  return (
    <div className="max-w-4xl lg:w-full mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <RiShieldUserLine className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          Two-Factor Authentication
        </h1>
      </div>

      {!session?.user?.isTwoFactorAuthEnabled && view === "main" ? (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600">
              Add an extra layer of security to your account. When enabled,
              you'll need to enter both your password and an authentication code
              to sign in.
            </p>
          </div>
          <button
            onClick={handleEnable2FA}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Initializing..." : "Enable 2FA"}
          </button>
        </div>
      ) : (
        <div className="space-y-8 ">
          {/* Main Security Dashboard */}
          {view === "main" && (
            <SecurityDashboard
              onViewRecovery={() => setView("recovery")}
              onViewAudit={() => {
                loadAuditLogs();
                setView("audit");
              }}
              onDisable={handleDisable2FA}
              loading={loading}
            />
          )}

          {/* 2FA Setup Flow */}
          {view === "setup" && setupData && (
            <SetupFlow
              setupData={setupData}
              onVerify={verify2FAToken}
              onBack={() => setView("main")}
              loading={loading}
            />
          )}

          {/* Backup Codes Display */}
          {view === "backup" && setupData?.backupCodes && (
            <BackupCodesDisplay
              codes={setupData.backupCodes}
              onComplete={() => onComplete()}
            />
          )}

          {/* Recovery Code Management */}
          {view === "recovery" && (
            <RecoveryManagement
              onRegenerate={regenerateBackupCodes}
              onBack={() => setView("main")}
              generatedCodes={generatedCodes}
            />
          )}

          {/* Audit Log Viewer */}
          {view === "audit" && (
            <AuditLogViewer logs={auditLogs} onClose={() => setView("main")} />
          )}
        </div>
      )}
    </div>
  );
};

// Sub-components

export default TwoFactorAuthDashboard;
