// export const dynamic = "force-dynamic";
import { confirmEmailChangeTranslate } from "@/app/_translate/confirmEmailChangeTranslate";
// import { emailUpdatedStatusTranslate } from "@/app/_translate/emailUpdatedStatusTranslate";
import ConfirmEmailChange from "@/components/customer/emailUpdatedStatus";
// import "@/components/customer/emailUpdatedStatus.css";
// import ErrorHandler from "@/components/Error/errorHandler";
// import api from "@/components/util/axios.api";
import { lang } from "@/components/util/lang";
import type { Metadata } from "next";
// import { headers } from "next/headers";
export const metadata: Metadata = {
  title: confirmEmailChangeTranslate[lang].metadata.title,
  description: confirmEmailChangeTranslate[lang].metadata.description,
  keywords: confirmEmailChangeTranslate[lang].metadata.keywords,
};

// type Params = {
//   searchParams: {
//     token: string;
//   };
// };
// const page = async ({ searchParams }: Params) => {
//   const { token } = searchParams;
//   try {
//     if (!token) {
//       throw new Error(confirmEmailChangeTranslate[lang].emptyToken);
//     }

//     const { data } = await api.put(
//       `/customer/update-data/confirm-email-change?token=` + token,
//       {
//         headers: Object.fromEntries(headers().entries()), // Convert ReadonlyHeaders to plain object
//       }
//     );

//     // return (
//     //   <div className="messageBox">
//     //     <h2 className="heading">
//     //       {/* {message.includes("successfully") */}
//     //       {data.message &&
//     //         emailUpdatedStatusTranslate[lang].functions.onSuccess}
//     //       {/* emailUpdatedStatusTranslate[lang].functions.onFail */}
//     //     </h2>
//     //     {data.message && <p className="message">{data.message}</p>}
//     //   </div>
//     // );
//     return <ConfirmEmailChange  />;
//   } catch (error: any) {
//     return <ErrorHandler message={error?.message} />;
//   }
// };
const page = () => {
  return <ConfirmEmailChange />;
};
export default page;
