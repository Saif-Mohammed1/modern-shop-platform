"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiKey,
  FiLock,
  FiShield,
  // FiActivity,
  FiTrash2,
  FiUnlock,
} from "react-icons/fi";

import { type ClientAuditLogDetails } from "@/app/lib/types/audit.db.types";
import {
  type UserAuthType,
  UserRole,
  UserStatus,
} from "@/app/lib/types/users.db.types";
import { lang } from "@/app/lib/utilities/lang";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

import AuditLogTable from "./AuditLogTable";
import { SecurityActionsModal } from "./SecurityActionsModal";

// GraphQL Mutations
const UPDATE_USER_BY_ADMIN = gql`
  mutation UpdateUserByAdmin($id: ID!, $input: UpdateUserByAdminInput!) {
    updateUserByAdmin(id: $id, input: $input) {
      _id
      name
      email
      phone
      role
      status
      created_at
      verification {
        email_verified
        phone_verified
      }
      two_factor_enabled
      login_notification_sent
      security {
        auditLog {
          action
          timestamp
          details {
            success
            message
            device {
              fingerprint
              device
              os
              browser
              ip
              location {
                city
                country
                latitude
                longitude
              }
              is_bot
            }
          }
        }
      }
    }
  }
`;

const FORCE_PASSWORD_RESET = gql`
  mutation ForcePasswordReset($id: ID!) {
    forcePasswordReset(id: $id) {
      message
    }
  }
`;

const REVOKE_SESSIONS = gql`
  mutation RevokeSessions($id: ID!) {
    revokeSessions(id: $id) {
      message
    }
  }
`;

const LOCK_ACCOUNT = gql`
  mutation LockAccount($id: ID!) {
    lockAccount(id: $id) {
      message
    }
  }
`;

const UNLOCK_ACCOUNT = gql`
  mutation UnlockAccount($id: ID!) {
    unlockAccount(id: $id) {
      message
    }
  }
`;

const DELETE_USER_BY_ADMIN = gql`
  mutation DeleteUserByAdmin($id: ID!) {
    deleteUserByAdmin(id: $id) {
      message
    }
  }
`;

interface UserEditPageProps {
  user: UserAuthType & {
    security: {
      auditLog: ClientAuditLogDetails[];
    };
  };
}

// GraphQL response types
interface UpdateUserResponse {
  updateUserByAdmin: UserAuthType & {
    security: {
      auditLog: ClientAuditLogDetails[];
    };
  };
}

interface SecurityActionResponse {
  message: string;
}

interface DeleteUserResponse {
  deleteUserByAdmin: {
    message: string;
  };
}
export default function UserEditPage({ user }: UserEditPageProps) {
  const router = useRouter();
  const [userData, setUser] = useState(user);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [updatingFields, setUpdatingFields] = useState<Set<keyof UserAuthType>>(
    new Set()
  );

  // GraphQL Mutations
  const [updateUserByAdmin, { loading }] = useMutation<UpdateUserResponse>(
    UPDATE_USER_BY_ADMIN,
    {
      onCompleted: (data) => {
        toast.success(
          data?.updateUserByAdmin
            ? usersTranslate.users[lang].editUsers.form.success
            : usersTranslate.users[lang].editUsers.form.failed
        );
        setUser(data.updateUserByAdmin);
        setUpdatingFields(new Set());
      },

      onError: (error) => {
        toast.error(
          error.message || usersTranslate.users[lang].editUsers.form.failed
        );
      },
    }
  );

  const [forcePasswordReset] = useMutation<{
    forcePasswordReset: SecurityActionResponse;
  }>(FORCE_PASSWORD_RESET, {
    onCompleted: (data) => {
      const message =
        data?.forcePasswordReset?.message ||
        usersTranslate.users[lang].editUsers.handleSecurityAction
          .forcePasswordReset.success;
      toast.success(message);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          usersTranslate.users[lang].editUsers.handleSecurityAction
            .forcePasswordReset.error
      );
    },
  });

  const [revokeSessions] = useMutation<{
    revokeSessions: SecurityActionResponse;
  }>(REVOKE_SESSIONS, {
    onCompleted: (data) => {
      const message =
        data?.revokeSessions?.message ||
        usersTranslate.users[lang].editUsers.handleSecurityAction.revokeSessions
          .success;
      toast.success(message);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          usersTranslate.users[lang].editUsers.handleSecurityAction
            .revokeSessions.error
      );
    },
  });

  const [lockAccount] = useMutation<{
    lockAccount: SecurityActionResponse;
  }>(LOCK_ACCOUNT, {
    onCompleted: (data) => {
      const message =
        data?.lockAccount?.message ||
        usersTranslate.users[lang].editUsers.handleSecurityAction.lockAccount
          .success;
      toast.success(message);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          usersTranslate.users[lang].editUsers.handleSecurityAction.lockAccount
            .error
      );
    },
  });

  const [unlockAccount] = useMutation<{
    unlockAccount: SecurityActionResponse;
  }>(UNLOCK_ACCOUNT, {
    onCompleted: (data) => {
      const message =
        data?.unlockAccount?.message ||
        usersTranslate.users[lang].editUsers.handleSecurityAction.unlockAccount
          .success;
      toast.success(message);
    },
    onError: (error) => {
      toast.error(
        error.message ||
          usersTranslate.users[lang].editUsers.handleSecurityAction
            .unlockAccount.error
      );
    },
  });

  const [deleteUserByAdmin] = useMutation<DeleteUserResponse>(
    DELETE_USER_BY_ADMIN,
    {
      onCompleted: (data) => {
        const message =
          data?.deleteUserByAdmin?.message ||
          usersTranslate.users[lang].editUsers.handleDeleteUser.success;
        toast.success(message);
        router.push("/dashboard/users");
      },
      onError: (error) => {
        toast.error(
          error.message ||
            usersTranslate.users[lang].editUsers.handleDeleteUser.failed
        );
      },
    }
  );
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
    await updateUserByAdmin({
      variables: {
        id: userData._id,
        input: {
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status,
        },
      },
    });
  };
  type SecurityAction =
    | "forcePasswordReset"
    | "revokeSessions"
    | "lockAccount"
    | "unlockAccount";

  // Security actions - simplified since onCompleted/onError handle the responses
  const handleSecurityAction = async (action: SecurityAction) => {
    switch (action) {
      case "forcePasswordReset":
        await forcePasswordReset({
          variables: { id: userData._id },
        });
        break;
      case "revokeSessions":
        await revokeSessions({
          variables: { id: userData._id },
        });
        break;
      case "lockAccount":
        await lockAccount({
          variables: { id: userData._id },
        });
        break;
      case "unlockAccount":
        await unlockAccount({
          variables: { id: userData._id },
        });
        break;
    }
  };

  // Dangerous actions - simplified since onCompleted/onError handle the responses
  const handleDeleteUser = async () => {
    await deleteUserByAdmin({
      variables: { id: userData._id },
    });
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
              (e) => {
                handleUpdate("name", e.target.value);
              }
              // debouncedUpdate(handleUpdate, "name", e.target.value)
            }
          />

          <Input
            label={usersTranslate.users[lang].editUsers.form.email.label}
            value={userData.email}
            type="email"
            onChange={(e) => {
              handleUpdate("email", e.target.value);
            }}
          />

          <Select
            options={Object.values(UserRole).map((role) => ({
              value: role,
              label:
                usersTranslate.users[lang].editUsers.form.role.options[role],
            }))}
            value={userData.role}
            onChange={(e) => {
              handleUpdate("role", e.target.value);
            }}
          />

          <Select
            options={Object.values(UserStatus).map((status) => ({
              value: status,
              label: usersTranslate.users[lang].editUsers.form.statuses[status],
            }))}
            value={userData.status}
            onChange={(e) => {
              handleUpdate("status", e.target.value);
            }}
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
              onClick={() => {
                setShowSecurityModal(true);
              }}
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
        onClose={() => {
          setShowSecurityModal(false);
        }}
        actions={[
          {
            label:
              usersTranslate.users[lang].editUsers.handleSecurityAction
                .lockAccount.label,
            icon: <FiLock />,
            handler: () => void handleSecurityAction("lockAccount"),
          },
          {
            label:
              usersTranslate.users[lang].editUsers.handleSecurityAction
                .unlockAccount.label,
            icon: <FiUnlock />,
            handler: () => void handleSecurityAction("unlockAccount"),
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
