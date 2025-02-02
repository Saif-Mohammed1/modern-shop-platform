import { usersTranslate } from "@/app/_translate/(protectedRoute)/(admin)/dashboard/usersTranslate";
import EditUser from "@/components/(admin)/dashboard/users/editUser";
import ErrorHandler from "@/components/Error/errorHandler";
import api from "@/components/util/api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
import { headers } from "next/headers";
type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;

  try {
    const {
      data: { data: user },
    } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });

    return {
      title: `${usersTranslate.users[lang].editUsers.metadata.title} - ${user.name}`,
      description: `${usersTranslate.users[lang].editUsers.metadata.description} ${user.name}. ${user.email}`,
      keywords: `${usersTranslate.users[lang].editUsers.metadata.keywords} ${user.name}, ${user.email}`,
    };
  } catch (error) {
    return {
      title: usersTranslate.users[lang].editUsers.metadata.title,
      description: usersTranslate.users[lang].editUsers.metadata.description,
      keywords: usersTranslate.users[lang].editUsers.metadata.keywords,
    };
  }
}

const page = async ({ params }: Props) => {
  const { id } = params;

  try {
    const {
      data: { data },
    } = await api.get(`/admin/dashboard/users/${id}`, {
      headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
    });
    return <EditUser currentUser={data} />;
  } catch (error: any) {
    return <ErrorHandler message={error?.message} />;
  }
};

export default page;
