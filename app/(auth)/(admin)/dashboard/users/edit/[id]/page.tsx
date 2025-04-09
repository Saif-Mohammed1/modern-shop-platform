import type { Metadata } from "next";
import { headers } from "next/headers";

import api from "@/app/lib/utilities/api";
import { lang } from "@/app/lib/utilities/lang";
import EditUser from "@/components/(admin)/dashboard/users/editUser";
import ErrorHandler from "@/components/Error/errorHandler";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;

  try {
    const {
      data: user,
    }: {
      data: {
        name: string;
        email: string;
      };
    } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return {
      title: `${usersTranslate.users[lang].editUsers.metadata.title} - ${user.name}`,
      description: `${usersTranslate.users[lang].editUsers.metadata.description} ${user.name}. ${user.email}`,
      keywords: `${usersTranslate.users[lang].editUsers.metadata.keywords} ${user.name}, ${user.email}`,
    };
  } catch (_) {
    return {
      title: usersTranslate.users[lang].editUsers.metadata.title,
      description: usersTranslate.users[lang].editUsers.metadata.description,
      keywords: usersTranslate.users[lang].editUsers.metadata.keywords,
    };
  }
}

const page = async (props: Props) => {
  const params = await props.params;
  const { id } = params;

  try {
    const { data } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: Object.fromEntries((await headers()).entries()), // Convert ReadonlyHeaders to plain object
    });
    return <EditUser user={data} />;
  } catch (error: unknown) {
    const { message } = error as Error;
    return <ErrorHandler message={message} />;
  }
};

export default page;
