import {
  RiHistoryLine,
  RiShieldCheckLine,
  RiShieldUserLine,
} from "react-icons/ri";

import { lang } from "@/app/lib/utilities/lang";
import { accountTwoFactorTranslate } from "@/public/locales/client/(auth)/account/twoFactorTranslate";

interface SecurityDashboardProps {
  onViewRecovery: () => void;
  onViewAudit: () => Promise<void>;
  onDisable: () => Promise<void>;
  loading: boolean;
}

const SecurityDashboard = ({
  onViewRecovery,
  onViewAudit,
  onDisable,
  loading,
}: SecurityDashboardProps) => (
  <div className="space-y-6">
    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
      <div className="flex items-center gap-2 text-green-600">
        <RiShieldCheckLine className="w-5 h-5" />
        <p className="font-medium">
          {accountTwoFactorTranslate[lang].SecurityDashboard.title}
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <SecurityCard
        icon={<RiShieldUserLine className="w-5 h-5" />}
        title={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard.title
        }
        description={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard
            .description
        }
        actionText={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard
            .actionText
        }
        onClick={onViewRecovery}
      />

      <SecurityCard
        icon={<RiHistoryLine className="w-5 h-5" />}
        title={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard2.title
        }
        description={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard2
            .description
        }
        actionText={
          accountTwoFactorTranslate[lang].SecurityDashboard.SecurityCard2
            .actionText
        }
        onClick={() => void onViewAudit()}
      />
    </div>

    <button
      onClick={() => void onDisable()}
      disabled={loading}
      className="w-full text-red-600 hover:text-red-700 font-medium py-2.5 rounded-lg border border-red-100 hover:border-red-200 transition-colors disabled:opacity-50"
    >
      {loading
        ? accountTwoFactorTranslate[lang].SecurityDashboard.button.loading
        : accountTwoFactorTranslate[lang].SecurityDashboard.button.label}
    </button>
  </div>
);

interface SecurityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText: string;
  onClick: () => void;
}

const SecurityCard = ({
  icon,
  title,
  description,
  actionText,
  onClick,
}: SecurityCardProps) => (
  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white rounded-lg shadow-sm">{icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        <button
          onClick={onClick}
          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          {actionText} →
        </button>
      </div>
    </div>
  </div>
);

export default SecurityDashboard;
