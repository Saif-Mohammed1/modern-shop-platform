"use client";

import {
  MdDelete,
  MdLaptop,
  MdPhoneAndroid,
  MdDesktopMac,
} from "react-icons/md";
import {
  AiFillDelete,
  AiFillLaptop,
  AiFillMobile,
  AiFillDesktop,
} from "react-icons/ai"; // Add more icons if needed

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
const DeviceInfoSection = ({ devices }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const getDeviceIcon = (deviceInfo) => {
    if (deviceInfo.toLowerCase().includes("android")) {
      return <MdPhoneAndroid />;
    } else if (
      deviceInfo.toLowerCase().includes("iphone") ||
      deviceInfo.toLowerCase().includes("ios")
    ) {
      return <MdPhoneAndroid />;
    } else if (deviceInfo.toLowerCase().includes("laptop")) {
      return <MdLaptop />;
    } else {
      return <MdDesktopMac />;
    }
  };

  const handleDeleteDevice = (deviceId) => {
    setSelectedDevice(deviceId);
    setShowDeleteModal(true);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Your Devices</h1>
      <ul className="divide-y divide-gray-200">
        {devices.map((devices) => (
          <li
            key={devices._id}
            className="py-4 flex justify-between items-center"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">
                {getDeviceIcon(devices.deviceInfo)}
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  {devices.deviceInfo}
                </p>
                <p className="text-sm text-gray-500">
                  Last Active:{" "}
                  {moment(devices.lastActiveAt).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    devices.isActive ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {devices.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDeleteDevice(devices._id)}
              className="text-red-500 hover:text-red-700"
            >
              <AiFillDelete className="text-2xl" />
            </button>
          </li>
        ))}
      </ul>

      {/* Delete Device Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-700 mb-6">
              Do you really want to remove this devices from your account?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Implement API call to delete devices here
                  console.log("Deleting devices: ", selectedDevice);
                  setShowDeleteModal(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DeviceInfoSectionV1 = ({ devices }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const lastActive = moment(devices.lastActiveAt);
    const now = moment();
    const diffMinutes = now.diff(lastActive, "minutes");
    setIsActive(diffMinutes < 30); // Set active status if last active is within 30 mins
  }, [devices.lastActiveAt]);

  const handleDelete = () => {
    // Handle delete logic here
    console.log("Delete devices:", devices._id);
  };

  return (
    <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-md">
      {/* OS Icon */}
      <div className="flex items-center">
        {devices.deviceInfo.includes("Linux") && (
          <FaLinux className="text-2xl text-gray-600" />
        )}
        {devices.deviceInfo.includes("Chrome") && (
          <FaChrome className="text-2xl text-gray-600 ml-2" />
        )}
        <div className="ml-4">
          <p className="text-sm font-semibold">IP: {devices.ipAddress}</p>
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

const DeviceInfoSectionV2 = ({ devices, deleteDevice }) => {
  const [devicesList, setDevicesList] = useState(devices || []);
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
