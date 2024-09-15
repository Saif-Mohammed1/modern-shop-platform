"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import fetchApi from "../util/axios.api";
import { signOut } from "next-auth/react";
import { useUser } from "../context/user.context";
import DeviceInfoSection from "./deviceInfoSection";
import api from "../util/axios.api";

const ChangePassword = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useUser();

  //console.log("user", user);

  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };
  const handelConfirmation = async () => {
    let loadingToast;
    if (!password || !newPassword || !confirmPassword) {
      toast.error("Please fill all the fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password are not same");
      return;
    }
    try {
      toast.loading("Updating Password...");

      await fetchApi("/customer/update-password", {
        method: "PATCH",
        body: JSON.stringify({ password, newPassword, confirmPassword }),
      });

      toast.success("Password Updated Successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error?.message || error || "Failed to update user data!");
    }
  };
  return (
    <div className="w-full max-w-3xl /mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      {/* Password Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Password:
        </label>
        <div className="flex items-center justify-between">
          <span>********</span>
          <button
            onClick={() => handleEditClick()}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing ? "Cancel" : "Change"}
          </button>
        </div>
        {isEditing && (
          <div className="mt-2">
            <div className="flex relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Old Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <div className="flex relative items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                name="NewPassword"
                placeholder="Enter Your New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showNewPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <div className="flex relative items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter Your ConfirmPassword Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />

              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <button
              onClick={handelConfirmation}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const ChangePasswordV2 = ({ devices }) => {
  const [devicesList, setDevicesList] = useState(devices || []);
  const [isEditing, setIsEditing] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // For delete confirmation
  const deleteDevice = (deviceId) => {
    setDevicesList((prevDevices) =>
      prevDevices.filter((device) => device._id !== deviceId)
    );
  };
  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleDeleteAccount = async () => {
    let toastLoading;
    try {
      toastLoading = toast.loading("Deleting account...");

      // API call to delete the user account
      await api.delete("/customer/");

      await signOut();

      toast.success("Account deleted successfully!");
    } catch (error) {
      toast.error(error?.message || error || "Failed to delete account!");
    } finally {
      toast.dismiss(toastLoading);
    }
  };

  const handlePasswordUpdate = async () => {
    let loadingToast;
    if (!password || !newPassword || !confirmPassword) {
      toast.error("Please fill all the fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New Password and Confirm Password are not the same");
      return;
    }
    try {
      toast.loading("Updating Password...");

      await api.patch("/customer/update-password", {
        password,
        newPassword,
        confirmPassword,
      });

      toast.success(
        "Password Updated Successfully!,We recommend you to Log Out of all devices and login again"
      );
    } catch (error) {
      toast.error(error?.message || error || "Failed to update password!");
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
      loadingToast = toast.loading("Signing out of all devices...");
      await api.delete("/auth/refresh-token");
      await signOut();
      toast.success("Signed out of all devices successfully!");
      setDevicesList([]);
    } catch (error) {
      toast.error(
        error?.message || error || "Failed to sign out of all devices!"
      );
    } finally {
      toast.dismiss(loadingToast);
    }
  };
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 shadow-lg rounded-lg min-h-screen overflow-hidden">
      <h1 className="text-2xl font-bold mb-6">Change Password</h1>

      {/* Password Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Password:
        </label>
        <div className="flex items-center justify-between">
          <span>********</span>
          <button
            onClick={handleEditClick}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing ? "Cancel" : "Change"}
          </button>
        </div>
        {isEditing && (
          <div className="mt-2">
            <div className="flex relative items-center">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter Your Old Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <div className="flex relative items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                name="NewPassword"
                placeholder="Enter Your New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showNewPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <div className="flex relative items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Enter Your Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border rounded px-3 py-2 w-full mt-1"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center font-medium text-lg cursor-pointer"
              >
                {showConfirmPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
              </span>
            </div>
            <button
              onClick={handlePasswordUpdate}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              Update
            </button>
          </div>
        )}
      </div>

      {/* Delete Account Button */}
      <button
        onClick={() => setShowDeleteModal(true)}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Delete Account
      </button>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">
              Are you sure?
            </h2>
            <p className="text-gray-700 mb-6">This action cannot be undone.</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Devices Section */}
      <div className="space-y-4 mt-4 ">
        <h1 className="text-3xl font-bold  text-gray-800 mb-6">My Devices</h1>{" "}
        <div className="max-h-[50vh] md:max-h-[70vh] overflow-y-auto">
          {devicesList.map((device) => (
            <DeviceInfoSection
              key={device._id}
              devices={device}
              deleteDevice={() => deleteDevice(device._id)}
            />
          ))}
        </div>
        <button
          onClick={handleSignoutAll}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Sign out of all devices
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordV2;
