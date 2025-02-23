"use client";

import { MdDelete } from "react-icons/md";

import {
  FaChrome,
  FaLinux,
  FaApple,
  FaWindows,
  FaAndroid,
  FaMobileAlt,
  FaNetworkWired,
} from "react-icons/fa"; // OS/Browser icons
import moment from "moment";
import { useEffect, useState } from "react";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  accountSettingsTranslate,
  DeviceInfoType,
} from "@/public/locales/client/(auth)/account/settingsTranslate";
import { lang } from "@/app/lib/utilities/lang";
moment.locale(lang ?? "uk");

const DeviceInfoSectionV2 = ({
  devices,
  deleteDevice,
}: {
  devices: DeviceInfoType;
  deleteDevice: () => void;
}) => {
  const [isActive, setIsActive] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const lastActive = moment(devices.lastActiveAt);
    const now = moment();
    const diffMinutes = now.diff(lastActive, "minutes");
    setIsActive(diffMinutes < 30);
  }, [devices.lastActiveAt]);

  const handleDelete = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        accountSettingsTranslate[lang].devices.functions.handleDelete.loading
      );

      await api.delete(`/customers/device-info/${devices._id}`);
      deleteDevice();
      toast.success(
        accountSettingsTranslate[lang].devices.functions.handleDelete.success
      );
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            accountSettingsTranslate[lang].devices.functions.handleDelete.error
        );
      } else {
        toast.error(accountSettingsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  // Determine OS Icon based on user agent string
  const getOSIcon = () => {
    const userAgent = devices.deviceInfo.toLowerCase();
    if (userAgent.includes("linux"))
      return <FaLinux className="text-2xl text-gray-600" />;
    if (userAgent.includes("windows"))
      return <FaWindows className="text-2xl text-blue-600" />;
    if (userAgent.includes("mac os"))
      return <FaApple className="text-2xl text-gray-800" />;
    if (userAgent.includes("android"))
      return <FaAndroid className="text-2xl text-green-600" />;
    if (userAgent.includes("iphone") || userAgent.includes("ios"))
      return <FaMobileAlt className="text-2xl text-blue-400" />;
    return <FaChrome className="text-2xl text-gray-600" />; // Default to Chrome icon
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md ">
      {/* OS Icon and IP Address */}

      <div className="flex items-center flex-grow">
        {/* Display OS Icon */}
        {getOSIcon()}

        <div className="ml-4">
          {/* IP Address with Icon */}
          <div className="flex items-center">
            <FaNetworkWired className="text-xl text-gray-500" />
            <p className="ml-2 text-sm font-semibold">
              {accountSettingsTranslate[lang].devices.details.ip}:{" "}
              {devices.ipAddress}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            {accountSettingsTranslate[lang].devices.details.lastActive}:{" "}
            {moment(devices.lastActiveAt).fromNow()}
          </p>
        </div>
      </div>
      {/* Active Status Indicator */}
      <div className="relative flex items-center  ">
        <span
          className={`w-3 h-3 rounded-full ${
            isActive ? "bg-green-500" : "bg-red-500"
          } absolute right-0 -top-1`}
        ></span>
      </div>
      {/* Delete Icon */}
      <button
        onClick={handleDelete}
        className="ml-4 text-red-600 hover:text-red-800"
      >
        <MdDelete className="text-2xl" />
      </button>
    </div>
  );
};

export default DeviceInfoSectionV2;
