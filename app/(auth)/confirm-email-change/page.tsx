import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { api_gql } from "@/app/lib/utilities/api.graphql";
import { lang } from "@/app/lib/utilities/lang";
import ConfirmEmailChange from "@/components/customers/emailUpdatedStatus";
import { confirmEmailChangeTranslate } from "@/public/locales/client/(public)/confirmEmailChangeTranslate";

export const metadata: Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};

const CONFIRM_EMAIL_CHANGE_MUTATION = `
  mutation ConfirmEmailChange($token: String!) {
    confirmEmailChange(token: $token) {
      message
    }
  }
`;

type searchParams = {
  token: string;
  error?: string;
};

const page = async (props: { searchParams: Promise<searchParams> }) => {
  const searchParams = await props.searchParams;
  const token = searchParams.token || undefined;
  const headersObj = Object.fromEntries((await headers()).entries());

  if (!token) {
    notFound();
  }

  try {
    const {
      confirmEmailChange: { message },
    } = await api_gql<{
      confirmEmailChange: {
        message: string;
      };
    }>(CONFIRM_EMAIL_CHANGE_MUTATION, { token }, headersObj);

    return <ConfirmEmailChange message={message} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ConfirmEmailChange error={message} />;
  }
};

export default page;
