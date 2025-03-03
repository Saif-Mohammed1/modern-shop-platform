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
import { AuditAction } from "@/app/lib/types/audit.types";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
interface UserEditPageProps {
  user: UserAuthType & {
    security: {
      auditLog: {
        timestamp: Date;
        action: AuditAction;
        details: object;
      }[];
    };
  };
}
export default function UserEditPage({ user }: UserEditPageProps) {
  const [userData, setUser] = useState(user);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  // Core update handler
  const handleUpdate = async (field: keyof UserAuthType, value: any) => {
    try {
      const response = await api.patch(
        `/admin/dashboard/users/${userData._id}`,
        {
          [field]: value,
          auditAction: AuditAction.USER_UPDATE,
        }
      );
      setUser(response.data);
      toast.success(usersTranslate.users[lang].editUsers.form.success);
    } catch (error) {
      toast.error(usersTranslate.users[lang].editUsers.form.failed);
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
      await api.post(`/admin/dashboard/users/${userData._id}/security`, {
        action,
        auditAction: AuditAction.SECURITY_ACTION,
      });
      toast.success(
        usersTranslate.users[lang].editUsers.handleSecurityAction[action]
          .success
      );
    } catch (error) {
      toast.error(
        usersTranslate.users[lang].editUsers.handleSecurityAction[action].error
      );
    }
  };

  // Dangerous actions
  const handleDeleteUser = async () => {
    try {
      await api.delete(`/admin/dashboard/users/${userData._id}`, {
        data: { auditAction: AuditAction.USER_DELETE },
      });
      toast.success(
        usersTranslate.users[lang].editUsers.handleDeleteUser.success
      );
      router.push("/admin/users");
    } catch (error) {
      toast.error(usersTranslate.users[lang].editUsers.handleDeleteUser.failed);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
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
        <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
          <FiTrash2 className="mr-2" />
          {usersTranslate.users[lang].editUsers.actions.deleteAccount}
        </Button>
      </div>

      {/* Main Content Tabs */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Account Management Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {usersTranslate.users[lang].editUsers.account}
          </h2>

          <Input
            label={usersTranslate.users[lang].editUsers.form.name.label}
            value={userData.name}
            onChange={(e) => handleUpdate("name", e.target.value)}
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
            onChange={(value) => handleUpdate("role", value)}
          />

          <Select
            options={Object.values(UserStatus).map((status) => ({
              value: status,
              label: usersTranslate.users[lang].editUsers.form.statuses[status],
            }))}
            value={userData.status}
            onChange={(value) => handleUpdate("status", value)}
          />
        </div>

        {/* Security Section */}
        <div className="space-y-4">
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
        <div className="space-y-4">
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
