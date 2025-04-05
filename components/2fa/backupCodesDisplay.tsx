import {RiShieldUserLine} from 'react-icons/ri';

import {lang} from '@/app/lib/utilities/lang';
import {accountTwoFactorTranslate} from '@/public/locales/client/(auth)/account/twoFactorTranslate';

const BackupCodesDisplay = ({codes, onComplete}: {codes: string[]; onComplete: () => void}) => (
  <div className="space-y-6">
    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
      <div className="flex items-center gap-2 text-orange-600">
        <RiShieldUserLine className="w-5 h-5" />
        <p className="font-medium">{accountTwoFactorTranslate[lang].BackupCodesDisplay.title}</p>
      </div>
      <p className="text-sm text-orange-600 mt-2">
        {accountTwoFactorTranslate[lang].BackupCodesDisplay.description}
      </p>
    </div>

    <div className="grid grid-cols-2 gap-4">
      {codes.map((code, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-md text-center font-mono">
          {code}
        </div>
      ))}
    </div>

    <div className="flex gap-3">
      <button
        onClick={() => {
          const blob = new Blob([codes.join('\n')], {type: 'text/plain'});
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'backup-codes.txt';
          a.click();
        }}
        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg"
      >
        {accountTwoFactorTranslate[lang].BackupCodesDisplay.actionText}
      </button>
      <button
        onClick={onComplete}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
      >
        {accountTwoFactorTranslate[lang].BackupCodesDisplay.continueText}
      </button>
    </div>
  </div>
);
export default BackupCodesDisplay;
