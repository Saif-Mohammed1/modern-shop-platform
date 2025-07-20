import { headers } from "next/headers";

// import type { UserAuthType } from "@/app/lib/types/users.db.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import ErrorHandler from "@/components/Error/errorHandler";
import UserAdminPage from "@components/(admin)/dashboard/users/userMangement";

type params = {
  id: string;
};
const GET_USER_QUERY = /* GraphQL */ `
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      _id
      name
      email
      phone
      role
      status
      created_at
      updated_at
      last_login
      password_changed_at
      preferences {
        language
        currency
      }
      verification {
        email_verified
        phone_verified
      }
      two_factor_enabled
      login_notification_sent
      security {
        two_factor_enabled
        rateLimits {
          login {
            locked
            last_attempt
            attempts
            lock_until
          }
          passwordReset {
            locked
            last_attempt
            attempts
            lock_until
          }
          verification {
            locked
            last_attempt
            attempts
            lock_until
          }
          _2fa {
            locked
            last_attempt
            attempts
            lock_until
          }
          backup_recovery {
            locked
            last_attempt
            attempts
            lock_until
          }
        }
        behavioralFlags {
          suspicious_device_change
          impossible_travel
          request_velocity
        }
        auditLog {
          _id
          timestamp
          action
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
        loginHistory {
          _id
          timestamp
          success
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
        last_login
        password_changed_at
      }
      authMethods
    }
  }
`;

const page = async (props: { params: Promise<params> }) => {
  const params = await props.params;
  const { id } = params;
  const headersObject = Object.fromEntries((await headers()).entries());

  try {
    const { getUserById } = await api_gql<{
      getUserById: any;
    }>(
      GET_USER_QUERY,
      {
        id,
      },
      headersObject
    );
    return <UserAdminPage user={getUserById} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
