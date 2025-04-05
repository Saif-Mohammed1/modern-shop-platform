'use client';


import {AnimatePresence, motion} from 'framer-motion';
import {DateTime} from 'luxon';
import {useRouter} from 'next/navigation';
import {useState} from 'react';
import toast from 'react-hot-toast';
import {
  FaAndroid,
  FaApple,
  FaChrome,
  FaFirefox,
  FaGlobe,
  FaKey,
  FaLinux,
  FaMobileAlt,
  FaNetworkWired,
  FaRegClock,
  FaRegWindowMaximize,
  FaRobot,
  FaSafari,
  FaWindows,
} from 'react-icons/fa';
import {MdComputer, MdDelete, MdRefresh, MdSecurity} from 'react-icons/md';

import {
  // RefreshTokenStatus,
  type sessionInfo,
} from '@/app/lib/types/session.types';
import api from '@/app/lib/utilities/api';
import {lang} from '@/app/lib/utilities/lang';
import {accountSettingsTranslate} from '@/public/locales/client/(auth)/account/settingsTranslate';

import ConfirmationModal from '../ui/ConfirmationModal';
import Tooltip from '../ui/Tooltip';

const DeviceSessionCard = ({
  session,
  revokeUserTokens,
}: {
  session: sessionInfo;
  revokeUserTokens: (id: string) => void;
}) => {
  const router = useRouter();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  // const isActive =
  //   session.status === RefreshTokenStatus.Active &&
  //   DateTime.fromJSDate(new Date(session.expiresAt)) > DateTime.now();
  const lastUsedRelative = DateTime.fromJSDate(new Date(session.lastUsedAt)).toRelative();
  // const expiresFormatted = DateTime.fromJSDate(
  //   new Date(session.expiresAt)
  // ).toLocaleString(DateTime.DATETIME_MED);
  const lastUsedTooltip = DateTime.fromJSDate(new Date(session.lastUsedAt)).toLocaleString(
    DateTime.DATETIME_FULL,
  );
  const expiresTooltip = DateTime.fromJSDate(new Date(session.expiresAt)).toLocaleString(
    DateTime.DATETIME_FULL,
  );
  const handleRevoke = async () => {
    const toastId = toast.loading(
      accountSettingsTranslate[lang].devices.functions.handleDelete.loading,
    );

    try {
      await api.delete(`/customers/device/${session._id}`);
      revokeUserTokens(session._id);
      toast.success(accountSettingsTranslate[lang].devices.functions.handleDelete.success);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : accountSettingsTranslate[lang].errors.global,
      );
    } finally {
      toast.dismiss(toastId);
      setShowRevokeModal(false);
    }
  };

  const StatusBadge = () => {
    // const statusConfig = {
    //   [RefreshTokenStatus.Active]: { color: "bg-green-500", text: "Active" },
    //   [RefreshTokenStatus.Revoked]: { color: "bg-red-500", text: "Revoked" },
    //   [RefreshTokenStatus.Rotated]: {
    //     color: "bg-yellow-500",
    //     text: "Needs Renewal",
    //   },
    // };

    return (
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${session.isActive ? 'bg-green-500' : 'bg-gray-300'}`}
        />
        <span className="text-sm font-medium text-gray-600">
          {session.isActive
            ? accountSettingsTranslate[lang].devices.status.active
            : accountSettingsTranslate[lang].devices.status.revoked}
        </span>
        {/* <span
          className={`w-2 h-2 rounded-full animate-pulse ${statusConfig[session.status].color}`}
        />
        <span className="text-sm font-medium text-gray-600">
          {accountSettingsTranslate[lang].devices.status[session.status]}
        </span> */}
      </motion.div>
    );
  };

  const DeviceIcon = () => {
    const {os, device} = session.deviceInfo;
    const iconConfig = {
      mobile: {icon: <FaMobileAlt />, color: 'text-blue-400'},
      linux: {icon: <FaLinux />, color: 'text-purple-500'},
      windows: {icon: <FaWindows />, color: 'text-blue-600'},
      mac: {icon: <FaApple />, color: 'text-gray-600'},
      android: {icon: <FaAndroid />, color: 'text-green-500'},
      default: {icon: <MdComputer />, color: 'text-gray-500'},
    };

    const deviceType: keyof typeof iconConfig = device.toLowerCase().includes('mobile')
      ? 'mobile'
      : (os.toLowerCase().match(/linux|windows|mac|android/)?.[0] as keyof typeof iconConfig) ||
        'default';

    return (
      <div className="relative">
        <div className={`text-2xl ${iconConfig[deviceType].color}`}>
          {iconConfig[deviceType].icon}
        </div>
        {session.deviceInfo.isBot ? <FaRobot className="absolute -top-1 -right-1 text-red-500 text-sm bg-white rounded-full" /> : null}
      </div>
    );
  };

  const BrowserIcon = () => {
    const {browser} = session.deviceInfo;
    const browserConfig = {
      chrome: {icon: <FaChrome />, color: 'text-blue-500'},
      firefox: {icon: <FaFirefox />, color: 'text-orange-500'},
      safari: {icon: <FaSafari />, color: 'text-blue-600'},
      default: {icon: <FaRegWindowMaximize />, color: 'text-gray-500'},
    };

    const browserType: keyof typeof browserConfig =
      (browser?.toLowerCase().match(/chrome|firefox|safari/)?.[0] as keyof typeof browserConfig) ||
      'default';

    return (
      <div className={`text-xl ${browserConfig[browserType].color}`}>
        {browserConfig[browserType].icon}
      </div>
    );
  };

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <DeviceIcon />

          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-800">
                {session.deviceInfo.brand} {session.deviceInfo.model || session.deviceInfo.device}
              </h3>
              <BrowserIcon />
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {session.deviceInfo.os}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                <FaNetworkWired className="text-gray-500" />
                <span className="font-mono text-xs">{session.deviceInfo.ip}</span>
              </div>

              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded">
                <FaGlobe className="text-gray-500" />
                <span>
                  {session.deviceInfo.location.city}, {session.deviceInfo.location.country}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <Tooltip content={lastUsedTooltip}>
                <div className="flex items-center gap-2">
                  <FaRegClock />
                  <span>{lastUsedRelative}</span>
                </div>
              </Tooltip>

              <Tooltip content={expiresTooltip}>
                <div className="flex items-center gap-2">
                  <FaKey />
                  <span>
                    {session.isActive &&
                    DateTime.fromJSDate(new Date(session.expiresAt)) > DateTime.now()
                      ? accountSettingsTranslate[lang].devices.details.expires
                      : accountSettingsTranslate[lang].devices.details.expired}
                  </span>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <StatusBadge />

          <AnimatePresence>
            {(isHovered || session.isActive) ? <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="flex items-center gap-2"
              >
                {session.isActive ? <Tooltip content={accountSettingsTranslate[lang].devices.actions.revoke}>
                    <button
                      onClick={() => setShowRevokeModal(true)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </Tooltip> : null}

                {!session.isActive && (
                  <Tooltip content={accountSettingsTranslate[lang].devices.actions.renew}>
                    <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 hover:text-blue-700 transition-colors">
                      <MdRefresh className="text-xl" />
                    </button>
                  </Tooltip>
                )}

                <Tooltip
                  content={
                    session.deviceInfo.isBot
                      ? 'Suspicious activity detected'
                      : 'Verified secure session'
                  }
                >
                  <MdSecurity
                    className={`text-lg ${session.deviceInfo.isBot ? 'text-red-500' : 'text-green-500'}`}
                  />
                </Tooltip>
              </motion.div> : null}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={() => setShowRevokeModal(false)}
        onConfirm={handleRevoke}
        title={accountSettingsTranslate[lang].devices.confirmRevoke.title}
        message={accountSettingsTranslate[lang].devices.confirmRevoke.message}
        confirmText={accountSettingsTranslate[lang].devices.actions.confirmRevoke}
        cancelText={accountSettingsTranslate[lang].button.cancel}
      />
    </motion.div>
  );
};

export default DeviceSessionCard;
