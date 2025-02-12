"use client";

import { MdDelete, MdRefresh, MdComputer, MdSecurity } from "react-icons/md";
import {
  FaChrome,
  FaLinux,
  FaApple,
  FaWindows,
  FaAndroid,
  FaMobileAlt,
  FaNetworkWired,
  FaClock,
  FaKey,
  FaRegClock,
  FaFirefox,
  FaSafari,
  FaRegWindowMaximize,
  FaGlobe,
  FaRobot,
} from "react-icons/fa";
import moment from "moment";
import { useEffect, useState } from "react";
import api from "@/app/lib/util/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { accountSettingsTranslate } from "@/app/_translate/(auth)/account/settingsTranslate";
import { lang } from "@/app/lib/util/lang";
import {
  RefreshTokenStatus,
  type sessionInfo,
} from "@/app/lib/types/refresh.types";

moment.locale(lang ?? "uk");

const DeviceSessionCard = ({
  session,
  revokeUserTokens,
}: {
  session: sessionInfo;
  revokeUserTokens: (id: string) => void;
}) => {
  const router = useRouter();
  const [location, setLocation] = useState(session.deviceInfo.location || "");
  const [isActive, setIsActive] = useState(
    session.status === RefreshTokenStatus.Active &&
      new Date(session.expiresAt) > new Date()
  );

  useEffect(() => {
    const geolocation = async () => {
      const response = await fetch(
        `https://ipapi.co/${session.deviceInfo.ip}/json/`
      );
      const data = await response.json();
      setLocation(`${data.city}, ${data.country_name}`);
    };
    // Fetch location details if not present
    if (!session.deviceInfo.location && session.deviceInfo.ip) {
      geolocation().catch(console.error);
    }
  }, [session.deviceInfo.ip, session.deviceInfo.location]);

  const handleRevoke = async () => {
    const toastId = toast.loading(
      accountSettingsTranslate[lang].devices.functions.handleDelete.loading
    );

    try {
      await api.delete(`/customer/device-info/${session._id}`);
      // deleteDevice(session._id);
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
    }
  };

  const getStatusBadge = () => (
    <div className="flex items-center gap-2">
      <span
        className={`w-3 h-3 rounded-full ${
          session.status === RefreshTokenStatus.Active
            ? "bg-green-500"
            : session.status === RefreshTokenStatus.Revoked
              ? "bg-red-500"
              : "bg-yellow-500"
        }`}
      />
      <span className="text-sm">
        {accountSettingsTranslate[lang].devices.status[session.status]}
      </span>
    </div>
  );

  const getDeviceIcon = () => {
    const { os, device } = session.deviceInfo;
    if (device.toLowerCase().includes("mobile"))
      return <FaMobileAlt className="text-2xl text-blue-400" />;
    if (os.toLowerCase().includes("linux"))
      return <FaLinux className="text-2xl text-gray-600" />;
    if (os.toLowerCase().includes("windows"))
      return <FaWindows className="text-2xl text-blue-600" />;
    if (os.toLowerCase().includes("mac"))
      return <FaApple className="text-2xl text-gray-800" />;
    if (os.toLowerCase().includes("android"))
      return <FaAndroid className="text-2xl text-green-600" />;
    return <MdComputer className="text-2xl text-gray-600" />;
  };

  const getClientIcon = () => {
    const { browser } = session.deviceInfo;
    if (browser?.toLowerCase().includes("chrome"))
      return <FaChrome className="text-xl text-blue-500" />;
    if (browser?.toLowerCase().includes("firefox"))
      return <FaFirefox className="text-xl text-orange-500" />;
    if (browser?.toLowerCase().includes("safari"))
      return <FaSafari className="text-xl text-blue-600" />;
    return <FaRegWindowMaximize className="text-xl text-gray-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="mt-1">
            {getDeviceIcon()}
            {session.deviceInfo.isBot && (
              <FaRobot className="text-red-500 mt-1" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {session.deviceInfo.brand}{" "}
                {session.deviceInfo.model || session.deviceInfo.device}
              </span>
              {getClientIcon()}
              <span className="text-sm text-gray-500">
                {session.deviceInfo.os}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FaNetworkWired />
                <span>{session.deviceInfo.ip}</span>
              </div>

              <div className="flex items-center gap-1">
                <FaGlobe />
                <span>{location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <FaRegClock />
                <span>
                  {accountSettingsTranslate[lang].devices.details.lastUsed}:{" "}
                  {moment(session.lastUsedAt).fromNow()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <FaKey />
                <span>
                  {accountSettingsTranslate[lang].devices.details.expires}:{" "}
                  {moment(session.expiresAt).format("lll")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          {getStatusBadge()}

          <div className="flex items-center gap-2">
            {isActive && (
              <button
                onClick={handleRevoke}
                className="p-2 hover:bg-red-50 rounded-full text-red-600 hover:text-red-800"
                aria-label={
                  accountSettingsTranslate[lang].devices.actions.revoke
                }
              >
                <MdDelete className="text-xl" />
              </button>
            )}

            {session.status === RefreshTokenStatus.Rotated && (
              <button
                className="p-2 hover:bg-blue-50 rounded-full text-blue-600"
                aria-label={
                  accountSettingsTranslate[lang].devices.actions.renew
                }
              >
                <MdRefresh className="text-xl" />
              </button>
            )}

            <MdSecurity
              className={`text-lg ${
                session.deviceInfo.isBot ? "text-red-500" : "text-green-500"
              }`}
              title={
                session.deviceInfo.isBot ? "Bot detected" : "Verified device"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceSessionCard;
