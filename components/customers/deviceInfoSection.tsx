"use client";

import { gql, useMutation } from "@apollo/client";
import { motion } from "framer-motion";
import { DateTime } from "luxon";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
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
} from "react-icons/fa";
import { MdComputer, MdDelete, MdRefresh, MdSecurity } from "react-icons/md";

import {
  // RefreshTokenStatus,
  type sessionInfo,
} from "@/app/lib/types/session.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";

import ConfirmationModal from "../ui/ConfirmationModal";
import Tooltip from "../ui/Tooltip";

const DELETE_DEVICE_ID = gql`
  mutation DeleteDevice($id: String!) {
    revokeSession(id: $id) {
      message
    }
  }
`;
const DeviceSessionCard = ({
  session,
  revokeUserTokens,
}: {
  session: sessionInfo;
  revokeUserTokens: (id: string) => void;
}) => {
  const router = useRouter();
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeSession] = useMutation(DELETE_DEVICE_ID);
  // const is_active =
  //   session.status === RefreshTokenStatus.Active &&
  //   DateTime.fromJSDate(new Date(session.expires_at)) > DateTime.now();
  const lastUsedRelative = DateTime.fromJSDate(
    new Date(session.last_used_at)
  ).toRelative();
  // const expiresFormatted = DateTime.fromJSDate(
  //   new Date(session.expires_at)
  // ).toLocaleString(DateTime.DATETIME_MED);
  const lastUsedTooltip = DateTime.fromJSDate(
    new Date(session.last_used_at)
  ).toLocaleString(DateTime.DATETIME_FULL);
  const expiresTooltip = DateTime.fromJSDate(
    new Date(session.expires_at)
  ).toLocaleString(DateTime.DATETIME_FULL);
  const handleRevoke = async () => {
    const toastId = toast.loading(
      accountSettingsTranslate[lang].devices.functions.handleDelete.loading
    );

    try {
      await revokeSession({ variables: { id: session._id } });
      revokeUserTokens(session._id);
      toast.success(
        accountSettingsTranslate[lang].devices.functions.handleDelete.success
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : accountSettingsTranslate[lang].errors.global
      );
    } finally {
      toast.dismiss(toastId);
      setShowRevokeModal(false);
    }
  };

  const StatusBadge = () => {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 sm:gap-2"
      >
        <span
          className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-pulse ${session.is_active ? "bg-green-500" : "bg-gray-300"}`}
        />
        <span className="text-xs sm:text-sm font-medium text-gray-600 truncate">
          {session.is_active
            ? accountSettingsTranslate[lang].devices.status.active
            : accountSettingsTranslate[lang].devices.status.revoked}
        </span>
      </motion.div>
    );
  };

  const DeviceIcon = () => {
    const { os, device } = session.device_info;
    const iconConfig = {
      mobile: { icon: <FaMobileAlt />, color: "text-blue-400" },
      linux: { icon: <FaLinux />, color: "text-purple-500" },
      windows: { icon: <FaWindows />, color: "text-blue-600" },
      mac: { icon: <FaApple />, color: "text-gray-600" },
      android: { icon: <FaAndroid />, color: "text-green-500" },
      default: { icon: <MdComputer />, color: "text-gray-500" },
    };

    const deviceType: keyof typeof iconConfig = device
      .toLowerCase()
      .includes("mobile")
      ? "mobile"
      : (os
          .toLowerCase()
          .match(
            /linux|windows|mac|android/
          )?.[0] as keyof typeof iconConfig) || "default";

    return (
      <div className="relative">
        <div className={`text-2xl ${iconConfig[deviceType].color}`}>
          {iconConfig[deviceType].icon}
        </div>
        {session.device_info.is_bot ? (
          <FaRobot className="absolute -top-1 -right-1 text-red-500 text-sm bg-white rounded-full" />
        ) : null}
      </div>
    );
  };

  const BrowserIcon = () => {
    const { browser } = session.device_info;
    const browserConfig = {
      chrome: { icon: <FaChrome />, color: "text-blue-500" },
      firefox: { icon: <FaFirefox />, color: "text-orange-500" },
      safari: { icon: <FaSafari />, color: "text-blue-600" },
      default: { icon: <FaRegWindowMaximize />, color: "text-gray-500" },
    };

    const browserType: keyof typeof browserConfig =
      (browser
        ?.toLowerCase()
        .match(/chrome|firefox|safari/)?.[0] as keyof typeof browserConfig) ||
      "default";

    return (
      <div className={`text-xl ${browserConfig[browserType].color}`}>
        {browserConfig[browserType].icon}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all">
      {/* Header with device info and status */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <DeviceIcon />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                {session.device_info.brand}{" "}
                {session.device_info.model || session.device_info.device}
              </h3>
              <BrowserIcon />
            </div>
            <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
              {session.device_info.os}
            </span>
          </div>
        </div>

        {/* Status and actions - always visible on mobile */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <StatusBadge />

          {/* Action buttons - always visible, responsive sizing */}
          <div className="flex items-center gap-1">
            {session.is_active ? (
              <Tooltip
                content={accountSettingsTranslate[lang].devices.actions.revoke}
              >
                <button
                  onClick={() => {
                    setShowRevokeModal(true);
                  }}
                  className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                >
                  <MdDelete className="text-lg sm:text-xl" />
                </button>
              </Tooltip>
            ) : (
              <Tooltip
                content={accountSettingsTranslate[lang].devices.actions.renew}
              >
                <button className="p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg text-blue-500 hover:text-blue-700 transition-colors">
                  <MdRefresh className="text-lg sm:text-xl" />
                </button>
              </Tooltip>
            )}

            <Tooltip
              content={
                session.device_info.is_bot
                  ? "Suspicious activity detected"
                  : "Verified secure session"
              }
            >
              <div className="p-1.5 sm:p-2">
                <MdSecurity
                  className={`text-sm sm:text-lg ${session.device_info.is_bot ? "text-red-500" : "text-green-500"}`}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Device details */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded">
            <FaNetworkWired className="text-gray-500 flex-shrink-0" />
            <span className="font-mono text-xs truncate">
              {session.device_info.ip}
            </span>
          </div>

          <div className="flex items-center gap-2 bg-gray-50 px-2 sm:px-3 py-1 rounded">
            <FaGlobe className="text-gray-500 flex-shrink-0" />
            <span className="truncate">
              {session.device_info.location.city},{" "}
              {session.device_info.location.country}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-500">
          <Tooltip content={lastUsedTooltip}>
            <div className="flex items-center gap-2">
              <FaRegClock className="flex-shrink-0" />
              <span className="truncate">{lastUsedRelative}</span>
            </div>
          </Tooltip>

          <Tooltip content={expiresTooltip}>
            <div className="flex items-center gap-2">
              <FaKey className="flex-shrink-0" />
              <span className="truncate">
                {session.is_active &&
                DateTime.fromJSDate(new Date(session.expires_at)) >
                  DateTime.now()
                  ? accountSettingsTranslate[lang].devices.details.expires
                  : accountSettingsTranslate[lang].devices.details.expired}
              </span>
            </div>
          </Tooltip>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={() => {
          setShowRevokeModal(false);
        }}
        onConfirm={handleRevoke}
        title={accountSettingsTranslate[lang].devices.confirmRevoke.title}
        message={accountSettingsTranslate[lang].devices.confirmRevoke.message}
        confirmText={
          accountSettingsTranslate[lang].devices.actions.confirmRevoke
        }
        cancelText={accountSettingsTranslate[lang].button.cancel}
      />
    </div>
  );
};

export default DeviceSessionCard;
