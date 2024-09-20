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
import api from "../util/axios.api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const DeviceInfoSectionV2 = ({ devices, deleteDevice }) => {
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
      toastLoading = toast.loading("Deleting device...");

      await api.delete(`/customer/device-info/${devices._id}`);
      deleteDevice();
      toast.success("Device deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error(error?.message || error || "An error occurred");
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

      <div className="flex items-center">
        {/* Display OS Icon */}
        {getOSIcon()}

        <div className="ml-4">
          {/* IP Address with Icon */}
          <div className="flex items-center">
            <FaNetworkWired className="text-xl text-gray-500" />
            <p className="ml-2 text-sm font-semibold">
              IP: {devices.ipAddress}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Last Active: {moment(devices.lastActiveAt).fromNow()}
          </p>
        </div>
      </div>
      {/* Active Status Indicator */}
      <div className="relative flex items-center">
        <span
          className={`w-3 h-3 rounded-full ${
            isActive ? "bg-green-500" : "bg-red-500"
          } absolute right-0 top-0`}
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
