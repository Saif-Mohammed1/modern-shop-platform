"use client";

import { gql, useMutation, useQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { RiShieldUserLine } from "react-icons/ri";

import { lang } from "@/app/lib/utilities/lang";
import { accountTwoFactorTranslate } from "@/public/locales/client/(auth)/account/twoFactorTranslate";

import AuditLogViewer from "./auditLogViewer";
import BackupCodesDisplay from "./backupCodesDisplay";
import RecoveryManagement from "./recoveryManagement";
import SecurityDashboard from "./securityDashboard";
import SetupFlow from "./setupFlow";

// GraphQL Mutations and Queries
const ENABLE_2FA = gql`
  mutation Enable2FA {
    enable2FA {
      qrCode
      manualEntryCode
      backupCodes
    }
  }
`;

const VERIFY_2FA = gql`
  mutation Verify2FA($token: String!) {
    verify2FA(token: $token) {
      message
    }
  }
`;

const DISABLE_2FA = gql`
  mutation Disable2FA {
    disable2FA {
      message
    }
  }
`;

const REGENERATE_BACKUP_CODES = gql`
  mutation RegenerateBackupCodes {
    regenerateBackupCodes {
      newCodes
    }
  }
`;

const GET_AUDIT_LOGS = gql`
  query GetTwoFactorAuditLogs {
    getTwoFactorAuditLogs {
      timestamp
      action
      metadata
    }
  }
`;

// Response types
interface Enable2FAResponse {
  enable2FA: {
    qrCode: string;
    manualEntryCode: string;
    backupCodes: string[];
  };
}

interface Verify2FAResponse {
  verify2FA: {
    message: string;
  };
}

interface Disable2FAResponse {
  disable2FA: {
    message: string;
  };
}

interface RegenerateBackupCodesResponse {
  regenerateBackupCodes: {
    newCodes: string[];
  };
}

interface AuditLogsResponse {
  getTwoFactorAuditLogs: {
    timestamp: string;
    action: string;
    metadata: string;
  }[];
}

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

  // GraphQL Mutations
  const [enable2FAMutation] = useMutation<Enable2FAResponse>(ENABLE_2FA, {
    onCompleted: (data) => {
      setSetupData(data.enable2FA);
      setView("setup");
      setLoading(false);
      toast.success(
        accountTwoFactorTranslate[lang].functions.handleEnable2FA.success
      );
    },
    onError: (error) => {
      setLoading(false);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        accountTwoFactorTranslate[lang].functions.handleEnable2FA.failed;
      toast.error(errorMessage);
    },
  });

  const [verify2FAMutation] = useMutation<Verify2FAResponse>(VERIFY_2FA, {
    onCompleted: () => {
      setView("backup");
      setLoading(false);
      toast.success(
        accountTwoFactorTranslate[lang].functions.handleVerify2FA.success
      );
    },
    onError: (error) => {
      setLoading(false);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        accountTwoFactorTranslate[lang].functions.handleVerify2FA.failed;
      toast.error(errorMessage);
    },
  });

  const [disable2FAMutation] = useMutation<Disable2FAResponse>(DISABLE_2FA, {
    onCompleted: () => {
      void update({
        ...session,
        user: { ...session?.user, isTwoFactorAuthEnabled: false },
      });
      setView("main");
      setLoading(false);
      toast.success(
        accountTwoFactorTranslate[lang].functions.handleDisable2FA.success
      );
    },
    onError: (error) => {
      setLoading(false);
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        (error.networkError ? "Network error occurred" : null) ||
        accountTwoFactorTranslate[lang].functions.handleDisable2FA.failed;
      toast.error(errorMessage);
    },
  });

  const [regenerateBackupCodesMutation] =
    useMutation<RegenerateBackupCodesResponse>(REGENERATE_BACKUP_CODES, {
      onCompleted: (data) => {
        setSetupData((prev) => ({
          ...prev!,
          backupCodes: data.regenerateBackupCodes.newCodes,
        }));
        setGeneratedCodes(data.regenerateBackupCodes.newCodes);
        toast.success(
          accountTwoFactorTranslate[lang].functions.handleRegenerateBackupCodes
            .success
        );
      },
      onError: (error) => {
        const errorMessage =
          error.graphQLErrors?.[0]?.message ||
          (error.networkError ? "Network error occurred" : null) ||
          accountTwoFactorTranslate[lang].functions.handleRegenerateBackupCodes
            .failed;
        toast.error(errorMessage);
      },
    });

  const { refetch: refetchAuditLogs } = useQuery<AuditLogsResponse>(
    GET_AUDIT_LOGS,
    {
      skip: true,
      onCompleted: (data) => {
        const logs = data.getTwoFactorAuditLogs.map((log) => ({
          timestamp: new Date(log.timestamp),
          action: log.action,
          metadata: JSON.parse(log.metadata) as SecurityMetadata,
        }));
        setAuditLogs(logs);
      },
      onError: (error) => {
        const errorMessage =
          error.graphQLErrors?.[0]?.message ||
          (error.networkError ? "Network error occurred" : null) ||
          accountTwoFactorTranslate[lang].functions.handleLoadAuditLogs.failed;
        toast.error(errorMessage);
      },
    }
  );
  // Main 2FA Status Management
  const handleEnable2FA = async () => {
    try {
      setLoading(true);
      await enable2FAMutation();
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  const verify2FAToken = async (token: string) => {
    try {
      setLoading(true);
      await verify2FAMutation({
        variables: { token },
      });
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await disable2FAMutation();
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      await regenerateBackupCodesMutation();
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };

  // Audit Logs
  const loadAuditLogs = async () => {
    try {
      await refetchAuditLogs();
    } catch (_error) {
      // Error handling is done in onError callback
      // Silent catch to prevent unhandled promise rejection
    }
  };
  const onComplete = async () => {
    try {
      setView("main");
      await update({
        ...session,
        user: { ...session?.user, isTwoFactorAuthEnabled: true },
      });
      toast.success(
        accountTwoFactorTranslate[lang].functions.handleEnable2FA.success
      );
    } catch (error: unknown) {
      toast.error(
        (error as Error)?.message ||
          accountTwoFactorTranslate[lang].functions.handleEnable2FA.failed
      );
    }
  };
  return (
    <div className="max-w-4xl lg:w-full #mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <RiShieldUserLine className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          {accountTwoFactorTranslate[lang].title}
        </h1>
      </div>

      {!session?.user?.two_factor_enabled && view === "main" ? (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600">
              {accountTwoFactorTranslate[lang].description}
            </p>
          </div>
          <button
            onClick={handleEnable2FA}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading
              ? accountTwoFactorTranslate[lang].functions.handleEnable2FA
                  .loading
              : accountTwoFactorTranslate[lang].functions.handleEnable2FA.label}
          </button>
        </div>
      ) : (
        <div className="space-y-8 ">
          {/* Main Security Dashboard */}
          {view === "main" && (
            <SecurityDashboard
              onViewRecovery={() => {
                setView("recovery");
              }}
              onViewAudit={async () => {
                await loadAuditLogs();
                setView("audit");
              }}
              onDisable={handleDisable2FA}
              loading={loading}
            />
          )}

          {/* 2FA Setup Flow */}
          {view === "setup" && setupData ? (
            <SetupFlow
              setupData={setupData}
              onVerify={verify2FAToken}
              onBack={() => {
                setView("main");
              }}
              loading={loading}
            />
          ) : null}

          {/* Backup Codes Display */}
          {view === "backup" && setupData?.backupCodes ? (
            <BackupCodesDisplay
              codes={setupData.backupCodes}
              onComplete={onComplete}
            />
          ) : null}

          {/* Recovery Code Management */}
          {view === "recovery" && (
            <RecoveryManagement
              onRegenerate={regenerateBackupCodes}
              onBack={() => {
                setView("main");
              }}
              generatedCodes={generatedCodes}
            />
          )}

          {/* Audit Log Viewer */}
          {view === "audit" && (
            <AuditLogViewer
              logs={auditLogs}
              onClose={() => {
                setView("main");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Sub-components

export default TwoFactorAuthDashboard;
