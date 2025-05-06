"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { UserSessionSync } from "./UserSessionSync";

const Providers = ({
  children,
  initialSession,
}: {
  children: React.ReactNode;
  initialSession: Session | null;
}) => {
  return (
    <SessionProvider
      refetchInterval={
        Number(process.env.JWT_ACCESS_TOKEN_COOKIE_EXPIRES_IN || 15) * 60 - 80
      }
      basePath="/api/v1/auth"
      refetchOnWindowFocus={true}
    >
      <NuqsAdapter>
        <UserSessionSync initialSession={initialSession} />
        {children}
      </NuqsAdapter>
    </SessionProvider>
  );
};

export default Providers;
