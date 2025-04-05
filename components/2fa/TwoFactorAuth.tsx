'use client';

import {useSession} from 'next-auth/react';
import {useState} from 'react';
import {toast} from 'react-hot-toast';
import {RiShieldUserLine} from 'react-icons/ri';

import {lang} from '@/app/lib/utilities/lang';
import {accountTwoFactorTranslate} from '@/public/locales/client/(auth)/account/twoFactorTranslate';

import api from '../../app/lib/utilities/api';

import AuditLogViewer from './auditLogViewer';
import BackupCodesDisplay from './backupCodesDisplay';
import RecoveryManagement from './recoveryManagement';
import SecurityDashboard from './securityDashboard';
import SetupFlow from './setupFlow';

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
  const {data: session, update} = useSession();
  const [view, setView] = useState<'main' | 'setup' | 'verify' | 'backup' | 'recovery' | 'audit'>(
    'main',
  );
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
      const {data} = await api.post('/auth/2fa');
      setSetupData(data);
      setView('setup');
      toast.success(accountTwoFactorTranslate[lang].functions.handleEnable2FA.success);
    } catch (error: any) {
      toast.error(
        error?.message || accountTwoFactorTranslate[lang].functions.handleEnable2FA.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  const verify2FAToken = async (token: string) => {
    try {
      setLoading(true);
      await api.post('/auth/2fa/verify', {token});

      setView('backup');
      toast.success(accountTwoFactorTranslate[lang].functions.handleVerify2FA.success);
    } catch (error: any) {
      toast.error(
        error?.message || accountTwoFactorTranslate[lang].functions.handleVerify2FA.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setLoading(true);
      await api.post('/auth/2fa/disable');
      await update({
        ...session,
        user: {...session?.user, isTwoFactorAuthEnabled: false},
      });
      setView('main');
      toast.success(accountTwoFactorTranslate[lang].functions.handleDisable2FA.success);
    } catch (error: any) {
      toast.error(
        error?.message || accountTwoFactorTranslate[lang].functions.handleDisable2FA.failed,
      );
    } finally {
      setLoading(false);
    }
  };

  // Backup Codes Management
  // const verifyBackupCode = async (code: string) => {
  //   try {
  //     await api.post("/auth/2fa/backup/verify", { code });
  //     toast.success("Backup code verified!");
  //   } catch (error: any) {
  //     toast.error(error?.message || "Invalid backup code");
  //   }
  // };

  const regenerateBackupCodes = async () => {
    try {
      const {data} = await api.post('/auth/2fa/recovery');
      setSetupData((prev) => ({...prev!, backupCodes: data.newCodes}));
      setGeneratedCodes(data.newCodes);
      toast.success(accountTwoFactorTranslate[lang].functions.handleRegenerateBackupCodes.success);
    } catch (error: any) {
      toast.error(
        error?.message ||
          accountTwoFactorTranslate[lang].functions.handleRegenerateBackupCodes.failed,
      );
    }
  };

  // Audit Logs
  const loadAuditLogs = async () => {
    try {
      const {data} = await api.get('/auth/2fa/audit');
      setAuditLogs(data.logs);
    } catch (error: any) {
      toast.error(
        error?.message || accountTwoFactorTranslate[lang].functions.handleLoadAuditLogs.failed,
      );
    }
  };
  const onComplete = async () => {
    setView('main');
    await update({
      ...session,
      user: {...session?.user, isTwoFactorAuthEnabled: true},
    });
    toast.success(accountTwoFactorTranslate[lang].functions.handleEnable2FA.success);
  };
  return (
    <div className="max-w-4xl lg:w-full #mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <RiShieldUserLine className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">
          {accountTwoFactorTranslate[lang].title}
        </h1>
      </div>

      {!session?.user?.twoFactorEnabled && view === 'main' ? (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-gray-600">{accountTwoFactorTranslate[lang].description}</p>
          </div>
          <button
            onClick={() => void handleEnable2FA()}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading
              ? accountTwoFactorTranslate[lang].functions.handleEnable2FA.loading
              : accountTwoFactorTranslate[lang].functions.handleEnable2FA.label}
          </button>
        </div>
      ) : (
        <div className="space-y-8 ">
          {/* Main Security Dashboard */}
          {view === 'main' && (
            <SecurityDashboard
              onViewRecovery={() => setView('recovery')}
              onViewAudit={async () => {
                await loadAuditLogs();
                setView('audit');
              }}
              onDisable={handleDisable2FA}
              loading={loading}
            />
          )}

          {/* 2FA Setup Flow */}
          {view === 'setup' && setupData ? <SetupFlow
              setupData={setupData}
              onVerify={verify2FAToken}
              onBack={() => setView('main')}
              loading={loading}
            /> : null}

          {/* Backup Codes Display */}
          {view === 'backup' && setupData?.backupCodes ? <BackupCodesDisplay
              codes={setupData.backupCodes}
              onComplete={() => void onComplete()}
            /> : null}

          {/* Recovery Code Management */}
          {view === 'recovery' && (
            <RecoveryManagement
              onRegenerate={regenerateBackupCodes}
              onBack={() => setView('main')}
              generatedCodes={generatedCodes}
            />
          )}

          {/* Audit Log Viewer */}
          {view === 'audit' && <AuditLogViewer logs={auditLogs} onClose={() => setView('main')} />}
        </div>
      )}
    </div>
  );
};

// Sub-components

export default TwoFactorAuthDashboard;
