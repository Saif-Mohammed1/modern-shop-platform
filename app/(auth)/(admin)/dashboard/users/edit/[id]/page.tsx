import type { Metadata } from "next";
import { headers } from "next/headers";

import type { ClientAuditLogDetails } from "@/app/lib/types/audit.db.types";
import type { UserAuthType } from "@/app/lib/types/users.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import EditUser from "@/components/(admin)/dashboard/users/editUser";
import ErrorHandler from "@/components/Error/errorHandler";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

type Props = {
  params: Promise<{ id: string }>;
};
const GET_METADATA_QUERY = /* GraphQL */ `
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      name
      email
    }
  }
`;
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  const headersObj = Object.fromEntries((await headers()).entries()); // Convert ReadonlyHeaders to plain object
  try {
    const { getUserById } = await api_gql<{
      getUserById: Pick<UserAuthType, "name" | "email">;
    }>(GET_METADATA_QUERY, { id }, headersObj);

    return {
      title: `${usersTranslate.users[lang].editUsers.metadata.title} - ${getUserById.name}`,
      description: `${usersTranslate.users[lang].editUsers.metadata.description} ${getUserById.name}. ${getUserById.email}`,
      keywords: `${usersTranslate.users[lang].editUsers.metadata.keywords} ${getUserById.name}, ${getUserById.email}`,
    };
  } catch (_) {
    return {
      title: usersTranslate.users[lang].editUsers.metadata.title,
      description: usersTranslate.users[lang].editUsers.metadata.description,
      keywords: usersTranslate.users[lang].editUsers.metadata.keywords,
    };
  }
}
const GET_USER_QUERY = /* GraphQL */ `
  query findUserWithAuditLogById($id: ID!) {
    findUserWithAuditLogById(id: $id) {
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
const page = async (props: Props) => {
  const params = await props.params;
  const { id } = params;
  const headersObj = Object.fromEntries((await headers()).entries()); // Convert ReadonlyHeaders to plain object

  try {
    const { findUserWithAuditLogById } = await api_gql<{
      findUserWithAuditLogById: UserAuthType & {
        security: {
          auditLog: ClientAuditLogDetails[];
        };
      };
    }>(GET_USER_QUERY, { id }, headersObj);

    return <EditUser user={findUserWithAuditLogById} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
