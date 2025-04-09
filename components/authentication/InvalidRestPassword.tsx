// import type{ FC } from "react";
// import { lang } from "@/app/lib/utilities/lang";
// import { resetPasswordTranslate } from "@/public/locales/client/(public)/auth/resetPasswordTranslate";
// type InvalidRestPasswordProps = {
//   email: string;
//   message?: string;
// };
// const InvalidRestPassword: FC<InvalidRestPasswordProps> = ({
//   email,
//   message,
// }) => {
//   return (
//     <div className="flex flex-col items-center justify-center w-[380px] p-6 bg-white shadow-md rounded-lg">
//       <h2 className="text-2xl font-semibold text-gray-900 mb-4 text-center">
//         {resetPasswordTranslate[lang].form.title}
//       </h2>
//       {/* <p className="text-sm text-gray-600 mb-4 text-center">
//         {resetPasswordTranslate[lang].form.description}
//       </p> */}
//       <div className="w-full">
//         {/* <label className="block text-sm font-medium text-gray-700 mb-1">
//           {resetPasswordTranslate[lang].form.emailLabel}
//         </label> */}
//         <input
//           type="text"
//           value={email}
//           className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 cursor-not-allowed"
//           readOnly
//         />
//       </div>
//       {message && (
//         <span
//           className="mt-3 text-sm text-red-600 font-medium"
//           aria-live="polite"
//         >
//           {message}
//         </span>
//       )}
//     </div>
//   );
// };
// export default InvalidRestPassword;
import type {FC} from 'react';
import {FaExclamationTriangle} from 'react-icons/fa';

import {lang} from '@/app/lib/utilities/lang';
import {resetPasswordTranslate} from '@/public/locales/client/(public)/auth/resetPasswordTranslate';

type InvalidResetPasswordProps = {
  email: string;
  message: string;
};

const InvalidResetPassword: FC<InvalidResetPasswordProps> = ({email, message}) => {
  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center space-y-2">
        <FaExclamationTriangle className="mx-auto text-3xl text-yellow-500" />
        <h2 className="text-3xl font-bold text-gray-900">
          {resetPasswordTranslate[lang].invalidRestToken.title}
        </h2>
        <p className="text-gray-500">{resetPasswordTranslate[lang].invalidRestToken.subtitle}</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {resetPasswordTranslate[lang].invalidRestToken.emailLabel}
          </label>
          <div className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-900 truncate">{email}</p>
          </div>
        </div>

        {message ? <div className="flex items-start p-4 bg-red-50 rounded-lg">
            <FaExclamationTriangle className="flex-shrink-0 mt-1 text-lg text-red-400" />
            <span className="ml-3 text-sm text-red-700">{message}</span>
          </div> : null}
      </div>
    </div>
  );
};

export default InvalidResetPassword;

// Parent component usage remains the same:
/*
<div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
  <InvalidResetPassword email={email} message={error.message} />
</div>
*/
