'use client';

import {useState} from 'react';

import {lang} from '@/app/lib/utilities/lang';
import {accountTwoFactorTranslate} from '@/public/locales/client/(auth)/account/twoFactorTranslate';

import BackupCodeInput from './backupCodeInput';
import TotpInput from './totpInput';

interface TwoFactorFormProps {
  onVerify: (code: string) => Promise<void>;
  onBackupVerify: (codes: string[]) => Promise<void>;
  error: string;
  isLoading: boolean;
  back: () => void;
}

export const TwoFactorForm = ({
  onVerify,
  onBackupVerify,
  error,
  isLoading,
  back,
  // onResend,
}: TwoFactorFormProps) => {
  const [view, setView] = useState<'totp' | 'backup'>('totp');

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {accountTwoFactorTranslate[lang].TwoFactorForm.title}
      </h2>

      {view === 'totp' ? (
        <TotpInput
          onVerify={onVerify}
          isLoading={isLoading}
          error={error}
          // onResend={onResend}
          onSwitchToBackup={() => setView('backup')}
        />
      ) : (
        <BackupCodeInput
          onVerify={onBackupVerify}
          isLoading={isLoading}
          error={error}
          onSwitchToTotp={() => setView('totp')}
        />
      )}

      <div className="mt-4 text-center">
        <button onClick={() => back()} className="text-sm text-gray-600 hover:text-gray-800">
          {accountTwoFactorTranslate[lang].TwoFactorForm.button.backToLogin}
        </button>
      </div>
    </div>
  );
};
