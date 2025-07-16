import type { Metadata } from "next";

import { lang } from "@/app/lib/utilities/lang";
// import AppError from "@/components/util/appError";
import ChangePassword from "@/components/customers/changePassword";
import { accountSettingsTranslate } from "@/public/locales/client/(auth)/account/settingsTranslate";

// export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: accountSettingsTranslate[lang].metadata.title,
  description: accountSettingsTranslate[lang].metadata.description,
  keywords: accountSettingsTranslate[lang].metadata.keywords,
};

const page = async () => {
  // Render the ChangePassword component with the sessions data
  return <ChangePassword />;
};
// const page = async () => {
//   const headerStore = await headers();
//   try {
//     const { data } = await api.post<{
//       data: {
//         getActiveSessions: {
//           docs: sessionInfo[];
//         };
//       };
//     }>("/graphql", {
//       query: GET_SESSION_INFO,
//       headers: Object.fromEntries(headerStore.entries()), // convert headers to object
//     });
//     const sessions: sessionInfo[] = data.data.getActiveSessions.docs;

//     // Render the ChangePassword component with the sessions data
//     return <ChangePassword devices={sessions} />;
//   } catch (error: unknown) {
//     const { message } = error as Error;
//     return <ErrorHandler message={message} />;
//   }
// };

export default page;
