import type { Metadata } from "next";
import { headers } from "next/headers";

import type { sessionInfo } from "@/app/lib/types/session.types";
import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
// import AppError from "@/components/util/appError";
import ChangePassword from "@/components/customers/changePassword";
import ErrorHandler from "@/components/Error/errorHandler";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";

// export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};

const GET_SESSION_INFO = `
  query {
    getActiveSessions {
      docs {
        _id
        user_id
        device_id
        device_info {
          os
          browser
          device
          brand
          model
          is_bot
          ip
          location {
            city
            country
            latitude
            longitude
            source
          }
          fingerprint
        }
        hashed_token
        is_active
        revoked_at
        expires_at
        last_used_at
        created_at
      }
    }
  }
`;
const page = async () => {
  const headersObj = Object.fromEntries((await headers()).entries());
  try {
    const { getActiveSessions } = await api_gql<{
      getActiveSessions: {
        docs: sessionInfo[];
      };
    }>(GET_SESSION_INFO, undefined, headersObj);

    // Render the ChangePassword component with the sessions data
    return <ChangePassword devices={getActiveSessions.docs} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
