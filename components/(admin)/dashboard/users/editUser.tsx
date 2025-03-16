"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/app/lib/utilities/api";
import toast from "react-hot-toast";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";
import { lang } from "@/app/lib/utilities/lang";
import {
  UserAuthType,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.types";
import {
  FiLock,
  FiUnlock,
  FiTrash2,
  FiKey,
  FiShield,
  FiActivity,
} from "react-icons/fi";
import { SecurityActionsModal } from "./SecurityActionsModal";
import AuditLogTable from "./AuditLogTable";
import { SecurityAuditAction } from "@/app/lib/types/audit.types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
interface UserEditPageProps {
  user: UserAuthType & {
    security: {
      auditLog: {
        timestamp: Date;
        action: SecurityAuditAction;
        details: {
          device: {
            browser: string;
            os: string;
            device: string;
            ip: string;
            location: string;
            fingerprint: string;
          };
        };
      }[];
    };
  };
}
export default function UserEditPage({ user }: UserEditPageProps) {
  const [userData, setUser] = useState(user);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingFields, setUpdatingFields] = useState<Set<keyof UserAuthType>>(
    new Set()
  );
  const router = useRouter();
  // const debouncedUpdate = debounce(async (updateFn, field, value) => {
  //   try {
  //     await updateFn(field, value);
  //   } catch (error) {
  //     console.error("Update failed:", error);
  //   }
  // }, 5000); // 5 second delay
  // Core update handler
  const handleUpdate = (e: keyof UserAuthType, value: any) => {
    setUser((prev) => ({ ...prev, [e]: value }));

    setUpdatingFields((prev) => prev.add(e));
  };
  const confirmUpdate = async () => {
    setLoading(true);
    try {
      const response = await api.patch(
        `/admin/dashboard/users/${userData._id}`,
        {
          // [field]: value,

          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
          auditAction: SecurityAuditAction.USER_UPDATE,
        }
      );
      setUser(response.data);
      // rest updating fields
      setUpdatingFields(new Set());
      toast.success(usersTranslate.users[lang].editUsers.form.success);
    } catch (error: any) {
      toast.error(
        error.message || usersTranslate.users[lang].editUsers.form.failed
      );
    } finally {
      setLoading(false);
    }
  };
  type SecurityAction =
    | "forcePasswordReset"
    | "revokeSessions"
    | "lockAccount"
    | "unlockAccount";
  // Security actions
  const handleSecurityAction = async (action: SecurityAction) => {
    try {
      switch (action) {
        case "forcePasswordReset":
          await api.get(`/admin/dashboard/users/${userData._id}/security`);
          break;
        case "revokeSessions":
          await api.post(`/admin/dashboard/users/${userData._id}/security`);
          break;
        case "lockAccount":
          await api.put(`/admin/dashboard/users/${userData._id}/security`);
          break;
        case "unlockAccount":
          await api.patch(`/admin/dashboard/users/${userData._id}/security`);
          break;
      }

      toast.success(
        usersTranslate.users[lang].editUsers.handleSecurityAction[action]
          .success
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          usersTranslate.users[lang].editUsers.handleSecurityAction[action]
            .error
      );
    }
  };

  // Dangerous actions
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/dashboard/users/${userData._id}`);
      toast.success(
        usersTranslate.users[lang].editUsers.handleDeleteUser.success
      );
      router.push("/dashboard/users");
    } catch (error) {
      toast.error(usersTranslate.users[lang].editUsers.handleDeleteUser.failed);
    }
  };

  return (
    <div className="container mx-auto  space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">
            {userData.name}
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({userData.role})
            </span>
          </h1>
          <p className="text-gray-600">{userData.email}</p>
        </div>
        <ConfirmModal
          title={usersTranslate.users[lang].editUsers.actions.deleteConfirm}
          onConfirm={handleDeleteUser}
          // confirmVariant="destructive"
        >
          <Button variant="destructive" size="sm" icon={<FiTrash2 />} danger>
            {" "}
            {usersTranslate.users[lang].editUsers.actions.deleteAccount}
          </Button>
        </ConfirmModal>
        {/* <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
          <FiTrash2 className="mr-2" />
          {usersTranslate.users[lang].editUsers.actions.deleteAccount}
        </Button> */}
      </div>

      {/* Main Content Tabs */}
      <div className="flex flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0 justify-center items-center gap-6 flex-wrap">
        {/* Account Management Section */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold">
            {usersTranslate.users[lang].editUsers.account}
          </h2>

          <Input
            label={usersTranslate.users[lang].editUsers.form.name.label}
            value={userData.name}
            onChange={
              (e) => handleUpdate("name", e.target.value)
              // debouncedUpdate(handleUpdate, "name", e.target.value)
            }
          />

          <Input
            label={usersTranslate.users[lang].editUsers.form.email.label}
            value={userData.email}
            type="email"
            onChange={(e) => handleUpdate("email", e.target.value)}
          />

          <Select
            options={Object.values(UserRole).map((role) => ({
              value: role,
              label:
                usersTranslate.users[lang].editUsers.form.role.options[role],
            }))}
            value={userData.role}
            onChange={(e) => handleUpdate("role", e.target.value)}
          />

          <Select
            options={Object.values(UserStatus).map((status) => ({
              value: status,
              label: usersTranslate.users[lang].editUsers.form.statuses[status],
            }))}
            value={userData.status}
            onChange={(e) => handleUpdate("status", e.target.value)}
          />
          {updatingFields.size > 0 && (
            <Button
              variant="primary"
              onClick={confirmUpdate}
              className="w-full"
              loading={loading}
            >
              {usersTranslate.users[lang].editUsers.form.save}
            </Button>
          )}
        </div>

        {/* Security Section */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-semibold">
            {usersTranslate.users[lang].editUsers.sections.security}
          </h2>

          <div className="space-y-3">
            <Button
              variant="secondary"
              onClick={() => handleSecurityAction("forcePasswordReset")}
              className="w-full"
            >
              <FiKey className="mr-2" />
              {
                usersTranslate.users[lang].editUsers.handleSecurityAction
                  .forcePasswordReset.label
              }
            </Button>

            <Button
              variant="secondary"
              onClick={() => handleSecurityAction("revokeSessions")}
              className="w-full"
            >
              <FiShield className="mr-2" />
              {
                usersTranslate.users[lang].editUsers.handleSecurityAction
                  .revokeSessions.label
              }
            </Button>

            <Button
              variant="secondary"
              onClick={() => setShowSecurityModal(true)}
              className="w-full"
            >
              <FiLock className="mr-2" />
              {
                usersTranslate.users[lang].editUsers.handleSecurityAction
                  .advancedSettings.label
              }
            </Button>
          </div>
        </div>

        {/* Audit Log Section */}
        <div className="space-y-4 w-full">
          <h2 className="text-xl font-semibold">
            {usersTranslate.users[lang].editUsers.auditLog.sections.title}
          </h2>
          <AuditLogTable
            data={userData.security.auditLog}
            translations={
              usersTranslate.users[lang].editUsers.auditLog.sections
            }
          />
        </div>
      </div>

      {/* Modals */}
      <SecurityActionsModal
        open={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        actions={[
          {
            label:
              usersTranslate.users[lang].editUsers.handleSecurityAction
                .lockAccount.label,
            icon: <FiLock />,
            handler: () => handleSecurityAction("lockAccount"),
          },
          {
            label:
              usersTranslate.users[lang].editUsers.handleSecurityAction
                .unlockAccount.label,
            icon: <FiUnlock />,
            handler: () => handleSecurityAction("unlockAccount"),
          },
        ]}
      />

      {/* <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={usersTranslate.users[lang].actions.deleteConfirm}
        onConfirm={handleDeleteUser}
        confirmText={usersTranslate.users[lang].actions.delete}
        confirmVariant="destructive"
      /> */}
      <ConfirmModal
        title={usersTranslate.users[lang].editUsers.actions.deleteConfirm}
        onConfirm={handleDeleteUser}
        // confirmVariant="destructive"
      >
        <Button variant="destructive" size="sm" icon={<FiTrash2 />} danger />
      </ConfirmModal>
    </div>
  );
}
