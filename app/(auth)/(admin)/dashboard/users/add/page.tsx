import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";
import AddUser from "@/components/(admin)/dashboard/users/addUser";
import { lang } from "@/app/lib/utilities/lang";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: usersTranslate.users[lang].addUsers.metadata.title,
  description: usersTranslate.users[lang].addUsers.metadata.description,
  keywords: usersTranslate.users[lang].addUsers.metadata.keywords,
};
const page = () => {
  return <AddUser />;
};

export default page;
