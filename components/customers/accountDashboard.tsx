"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";

import type { Event } from "@/app/lib/types/products.types";
import { lang } from "@/app/lib/utilities/lang";
import { accountDashboardTranslate } from "@/public/locales/client/(auth)/account/dashboardTranslate";

import api from "../../app/lib/utilities/api";

type EditableFields = "name" | "email" | "phone";
type FormDataType = {
  name: string;
  phone: string;
};
type Field = "name" | "phone";
type UserDataType = {
  name: string;
  email: string;
  phone: string;
  emailVerify: boolean;
};
const AccountDashboard = () => {
  const { data: session, update } = useSession();
  //   const { user } = use(UserContext); // Assuming these methods exist in your UserContext

  const [isEditing, setIsEditing] = useState<{
    [key in EditableFields]: boolean;
  }>({
    name: false,
    email: false,
    phone: false,
  });

  const [userData, setUserData] = useState<UserDataType>({
    name: session?.user?.name ?? "",
    email: session?.user?.email ?? "",
    phone: session?.user?.phone ?? "",
    emailVerify: session?.user?.verification.emailVerified ?? false,
  });

  const [formData, setFormData] = useState<FormDataType>({
    name: userData.name,
    phone: userData.phone,
  });
  const [changeEmail, setChangeEmail] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [showTokenField, setShowTokenField] = useState(false);
  const [changesApplied, setChangesApplied] = useState(false);

  const handleEditClick = (field: EditableFields) => {
    setIsEditing((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const handleInputChange = (e: Event) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSave = (field: Field) => {
    setUserData({
      ...userData,
      [field]: formData[field],
    });
    setIsEditing((prevState) => ({
      ...prevState,
      [field]: false,
    }));
    setChangesApplied(true); // Mark changes as applied
  };

  const handleApplyChanges = async () => {
    let loadingToast;
    let updatedData: Partial<FormDataType> = {};
    if (!session?.user) {
      toast.error(accountDashboardTranslate[lang].errors.global);
      return;
    }
    if (changesApplied) {
      Object.entries(formData).forEach(([key, value]) => {
        const keyType = key as Field;
        if (session?.user && formData[keyType] !== session?.user[keyType]) {
          updatedData[keyType] = value;
        }
      });

      try {
        toast.loading(
          accountDashboardTranslate[lang].functions.handleApplyChanges.loading
        );
        await api.put("/customers/update-data", updatedData);

        await update({
          ...session,
          user: {
            ...session?.user,
            name: updatedData.name ?? session?.user.name,
          },
        });

        toast.success(
          accountDashboardTranslate[lang].functions.handleApplyChanges.success
        );
        setChangesApplied(false); // Reset after applying changes
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(
            error?.message ||
              accountDashboardTranslate[lang].functions.handleApplyChanges.error
          );
        } else {
          {
            toast.error(accountDashboardTranslate[lang].errors.global);
          }
        }
      } finally {
        toast.dismiss(loadingToast);
      }
    }
  };
  const handleNotificationToggle = async () => {
    let loadingToast;
    try {
      loadingToast = toast.loading(
        accountDashboardTranslate[lang].functions.handleApplyChanges.loading
      );
      await api.patch("/customers/update-data", {
        loginNotificationSent: !session?.user?.loginNotificationSent,
      });
      await update({
        ...session,
        user: {
          ...session?.user,
          loginNotificationSent: !session?.user?.loginNotificationSent,
        },
      });
      toast.success(
        accountDashboardTranslate[lang].functions.handleApplyChanges.success
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            accountDashboardTranslate[lang].functions.handleApplyChanges.error
        );
      } else {
        {
          toast.error(accountDashboardTranslate[lang].errors.global);
        }
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };
  const handleSendVerificationLink = async () => {
    // Call your context function to send email verification link
    let loadingToast;
    try {
      loadingToast = toast.loading(
        accountDashboardTranslate[lang].functions.handleSendVerificationLink
          .loading
      );
      await api.get("/customers/update-data/verify-email");
      toast.success(
        accountDashboardTranslate[lang].functions.handleSendVerificationLink
          .success
      );
      setShowTokenField(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            accountDashboardTranslate[lang].functions.handleSendVerificationLink
              .error
        );
      } else {
        {
          toast.error(accountDashboardTranslate[lang].errors.global);
        }
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleVerifyToken = async () => {
    let loadingToast;
    if (!session?.user) {
      toast.error(accountDashboardTranslate[lang].errors.global);
      return;
    }
    try {
      loadingToast = toast.loading(
        accountDashboardTranslate[lang].functions.handleVerifyToken.loading
      );
      await api.put("/customers/update-data/verify-email", {
        verificationCode: verificationToken,
      });

      toast.success(
        accountDashboardTranslate[lang].functions.handleVerifyToken.success
      );

      await update({
        ...session,
        user: {
          ...session?.user,
          verification: {
            ...session?.user.verification,
            emailVerified: true,
          },
        },
      });
      setShowTokenField(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            accountDashboardTranslate[lang].functions.handleVerifyToken.error
        );
      } else {
        {
          toast.error(accountDashboardTranslate[lang].errors.global);
        }
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };
  const handleEmailChange = async () => {
    let loadingToast;
    try {
      loadingToast = toast.loading(
        accountDashboardTranslate[lang].functions.handleEmailChange.loading
      );
      await api.post("/customers/update-data/change-email", {
        newEmail: changeEmail,
      });
      setUserData((prevState) => ({
        ...prevState,
        email: changeEmail,
      }));
      setIsEditing((prevState) => ({
        ...prevState,
        email: false,
      }));
      toast.success(
        accountDashboardTranslate[lang].functions.handleEmailChange.success
      );
      setChangeEmail("");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(
          error?.message ||
            accountDashboardTranslate[lang].functions.handleEmailChange.error
        );
      } else {
        {
          toast.error(accountDashboardTranslate[lang].errors.global);
        }
      }
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="w-full max-w-3xl /mx-auto bg-white p-8 shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6">
        {accountDashboardTranslate[lang].title}
      </h1>

      {/* Name Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {accountDashboardTranslate[lang].form.name.label}:
        </label>
        <div className="flex items-center justify-between">
          <span>{userData.name}</span>
          <button
            onClick={() => {
              handleEditClick("name");
            }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.name
              ? accountDashboardTranslate[lang].button.isEdit.cancel
              : accountDashboardTranslate[lang].button.isEdit.edit}
          </button>
        </div>
        {isEditing.name ? (
          <div className="mt-2">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={
                accountDashboardTranslate[lang].form.name.placeholder
              }
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={() => {
                handleSave("name");
              }}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {accountDashboardTranslate[lang].button.save}
            </button>
          </div>
        ) : null}
      </div>

      {/* Email Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {accountDashboardTranslate[lang].form.email.label}:
        </label>
        <div className="flex items-center justify-between">
          <span>
            {userData.email}{" "}
            {userData.emailVerify ? (
              <span className="text-green-500">
                {accountDashboardTranslate[lang].form.email.verified}
              </span>
            ) : (
              <span className="text-red-500">
                {accountDashboardTranslate[lang].form.email.notVerified}
              </span>
            )}
          </span>
          <button
            onClick={() => {
              handleEditClick("email");
            }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.email
              ? accountDashboardTranslate[lang].button.isEdit.cancel
              : accountDashboardTranslate[lang].button.isEdit.edit}
          </button>
        </div>
        {isEditing.email ? (
          <div className="mt-2">
            <input
              type="email"
              name="email"
              value={changeEmail}
              onChange={(e) => {
                setChangeEmail(e.target.value);
              }}
              placeholder={
                accountDashboardTranslate[lang].form.email.placeholder
              }
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={handleEmailChange}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {accountDashboardTranslate[lang].button.update}
            </button>
          </div>
        ) : null}
        {!userData.emailVerify && (
          <div className="mt-4">
            <button
              onClick={handleSendVerificationLink}
              className="mt-2 bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              {accountDashboardTranslate[lang].button.sendVerificationLink}
            </button>
          </div>
        )}
        {showTokenField ? (
          <div className="mt-4">
            <label>
              {accountDashboardTranslate[lang].form.verificationToken.label}:
            </label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => {
                setVerificationToken(e.target.value);
              }}
              placeholder={
                accountDashboardTranslate[lang].form.verificationToken
                  .placeholder
              }
              className="border rounded px-3 py-2 w-full mt-1"
            />
            <button
              onClick={handleVerifyToken}
              className="mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              {accountDashboardTranslate[lang].button.verifyEmail}
            </button>
          </div>
        ) : null}
      </div>

      {/* Mobile Field */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          {accountDashboardTranslate[lang].form.phone.label}:
        </label>
        <div className="flex items-center justify-between">
          <span>{userData.phone || "*********"}</span>
          <button
            onClick={() => {
              handleEditClick("phone");
            }}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            {isEditing.phone
              ? accountDashboardTranslate[lang].button.isEdit.cancel
              : accountDashboardTranslate[lang].button.isEdit.edit}
          </button>
        </div>
        {isEditing.phone ? (
          <div className="mt-2">
            {/* <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={
                accountDashboardTranslate[lang].form.phone.placeholder
              }
              className="border rounded px-3 py-2 w-full mt-1"
            /> */}
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={
                accountDashboardTranslate[lang].form.phone.placeholder
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              pattern="[0-9]{10}"
            />
            <button
              onClick={() => {
                handleSave("phone");
              }}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {accountDashboardTranslate[lang].button.save}
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="font-medium text-gray-900">
              {accountDashboardTranslate[lang].notifications.login_title}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {accountDashboardTranslate[lang].notifications.login_description}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={session?.user?.loginNotificationSent}
              onChange={() => void handleNotificationToggle}
              className={`sr-only ${session?.user?.loginNotificationSent ? "peer-checked:bg-blue-500" : ""}`}
            />
            <div
              className={`w-11 h-6 ${session?.user?.loginNotificationSent ? "bg-blue-500" : "bg-gray-300"}  rounded-full transition-colors duration-300 peer-checked:bg-blue-500`}
            >
              <div
                className={`dot absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                  session?.user?.loginNotificationSent ? "translate-x-5" : ""
                }`}
              />
            </div>
          </label>
        </div>
      </div>
      <button
        onClick={handleApplyChanges}
        className={`mt-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition ${
          !changesApplied ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!changesApplied}
      >
        {accountDashboardTranslate[lang].button.applyChanges}
      </button>
    </div>
  );
};

export default AccountDashboard;
