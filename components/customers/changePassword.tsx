"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";

import {
  RefreshTokenStatus,
  type sessionInfo,
} from "@/app/lib/types/session.types";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";

import api from "../../app/lib/utilities/api";
import { deleteCookies } from "../../app/lib/utilities/cookies";
import { lang } from "../../app/lib/utilities/lang";

import DeviceInfoSection from "./deviceInfoSection";

const ChangePassword = ({ devices }: { devices: sessionInfo[] }) => {
  const [devicesList, setDevicesList] = useState(devices || []);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // For delete confirmation
  const revokeUserTokens = (deviceId: string) => {
    setDevicesList((prevDevices) =>
      prevDevices.map((device) =>
        String(device._id) === String(deviceId)
          ? { ...device, status: RefreshTokenStatus.Revoked }
          : device
      )
    );
  };
  // const deleteDevice = (deviceId: string) => {
  //   setDevicesList((prevDevices) =>
  //     prevDevices.filter((device) => device._id !== deviceId)
  //   );
  // };
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading(
        accountSettingsTranslate[lang].functions.handleDeleteAccount.loading
      );

      // API call to delete the user account
      await api.delete("/customers/");

      await signOut();
      await deleteCookies("refreshAccessToken");

      await api.post("/auth/logout");

      toast.success(
        accountSettingsTranslate[lang].functions.handleDeleteAccount.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountSettingsTranslate[lang].functions.handleDeleteAccount.error
        );
      } else {
        toast.error(accountSettingsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(toastLoading);
    }
  };
  const handlePasswordUpdate = async () => {
    let loadingToast;
    if (!password || !newPassword || !confirmPassword) {
      toast.error(
        accountSettingsTranslate[lang].functions.handlePasswordUpdate
          .requiredFields
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(
        accountSettingsTranslate[lang].functions.handlePasswordUpdate
          .passwordMismatch
      );
      return;
    }
    try {
      toast.loading(
        accountSettingsTranslate[lang].functions.handlePasswordUpdate.loading
      );

      await api.patch("/customers/update-password", {
        password,
        newPassword,
        confirmPassword,
      });

      toast.success(
        accountSettingsTranslate[lang].functions.handlePasswordUpdate.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountSettingsTranslate[lang].functions.handlePasswordUpdate.error
        );
      } else {
        toast.error(accountSettingsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(loadingToast);

      setPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };
  const handleSignoutAll = async () => {
    let loadingToast;
    try {
      loadingToast = toast.loading(
        accountSettingsTranslate[lang].functions.handleSignoutAll.loading
      );
      await api.delete("/auth/refresh-token");
      await signOut();
      await deleteCookies("refreshAccessToken");

      toast.success(
        accountSettingsTranslate[lang].functions.handleSignoutAll.success
      );
      setDevicesList([]);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error.message ||
            accountSettingsTranslate[lang].functions.handleSignoutAll.error
        );
      } else {
        toast.error(accountSettingsTranslate[lang].errors.global);
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };
  useEffect(() => {
    if (devices) {
      setDevicesList(devices);
    }
  }, [devices]);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg min-h-screen overflow-hidden">
      <h1 className="text-2xl font-bold mb-6">
        {accountSettingsTranslate[lang].title}
      </h1>

      {/* Password Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {accountSettingsTranslate[lang].form.password.label}:
        </label>
        <div className="flex items-center justify-between">
          <span>********</span>
          <button
            onClick={handleEditClick}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing
              ? accountSettingsTranslate[lang].button.cancel
              : accountSettingsTranslate[lang].button.change}
          </button>
        </div>
        {isEditing ? (
          <div className="mt-2">
            <div className="flex relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={
                  accountSettingsTranslate[lang].form.oldPassword.placeholder
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
            <div className="flex relative items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                name="NewPassword"
                placeholder={
                  accountSettingsTranslate[lang].form.newPassword.placeholder
                }
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                }}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <button
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showNewPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
            <div className="flex relative items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={
                  accountSettingsTranslate[lang].form.confirmPassword
                    .placeholder
                }
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                }}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </button>
            </div>
            <button
              onClick={handlePasswordUpdate}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {accountSettingsTranslate[lang].button.update}
            </button>
          </div>
        ) : null}
      </div>

      {/* Delete Account Button */}
      <button
        onClick={() => {
          setShowDeleteModal(true);
        }}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        {accountSettingsTranslate[lang].button.deleteAccount}
      </button>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              {accountSettingsTranslate[lang].showDeleteModal.title}
            </h2>
            <p className="text-gray-700 mb-6">
              {accountSettingsTranslate[lang].showDeleteModal.description}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                {accountSettingsTranslate[lang].showDeleteModal.cancel}
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                {accountSettingsTranslate[lang].showDeleteModal.delete}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Devices Section */}
      <div className="space-y-4 mt-4 ">
        <h1 className="text-3xl font-bold  text-gray-800 mb-6">
          {accountSettingsTranslate[lang].devices.title}
        </h1>{" "}
        <div className="max-h-[50vh] md:max-h-[70vh] overflow-y-auto">
          {devicesList && devicesList.length ? (
            devicesList.map((device) => (
              <DeviceInfoSection
                key={device._id}
                session={device}
                revokeUserTokens={() => {
                  revokeUserTokens(device._id);
                }}
              />
            ))
          ) : (
            <p className="text-gray-500 text-center">
              {accountSettingsTranslate[lang].devices.noDevices}
            </p>
          )}
        </div>
        <button
          onClick={handleSignoutAll}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          {accountSettingsTranslate[lang].devices.button.signoutAll}
        </button>
      </div>
    </div>
  );
};

export default ChangePassword;
