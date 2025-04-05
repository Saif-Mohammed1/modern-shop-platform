// // pages/429.tsx
// import { NextPage } from "next";
// import { cookies } from "next/headers";
// const TooManyRequests: NextPage = () => {
//   const RetryAfter = cookies().get("Retry-After")?.value;
//   return (
//     <div className="flex h-screen items-center justify-center bg-gray-100">
//       <div className="text-center bg-white p-10 rounded-lg shadow-lg">
//         <h1 className="text-4xl font-bold text-red-600 mb-4">429</h1>
//         <h2 className="text-2xl font-semibold text-gray-800 mb-4">
//           Too Many Requests
//         </h2>
//         <p className="text-gray-500 mb-8">
//           You have sent too many requests in a short amount of time.
//           <br />
//           Please try again later.
//         </p>
//       </div>
//     </div>
//   );
// };
// export default TooManyRequests;
// app/errors/429/TooManyRequests.tsx
import type {NextPage} from 'next';
import {cookies, headers} from 'next/headers';
import Link from 'next/link';
// import { useTranslations } from 'next-intl';
import {RiTimerFlashLine} from 'react-icons/ri';

import {lang} from '@/app/lib/utilities/lang';
import {tooManyRequestsTranslate} from '@/public/locales/client/(public)/tooManyRequestsTranslate';

export const metadata = {
  title: tooManyRequestsTranslate[lang].metadata.title,
  description: tooManyRequestsTranslate[lang].metadata.description,
  keywords: tooManyRequestsTranslate[lang].metadata.keywords,
};

const TooManyRequests: NextPage = async () => {
  const retryAfter = (await cookies()).get('Retry-After')?.value;
  const pathname = (await headers()).get('x-pathname') || '/';
  const formattedTime = retryAfter
    ? new Date(Date.now() + Number(retryAfter) * 1000).toLocaleTimeString()
    : null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <article className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 transition-all hover:shadow-2xl">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="bg-red-100 p-5 rounded-full animate-pulse">
            <RiTimerFlashLine className="w-16 h-16 text-red-600" />
          </div>

          <header>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              429 {tooManyRequestsTranslate[lang].title}
            </h1>
            <p className="text-lg text-gray-600">{tooManyRequestsTranslate[lang].description}</p>
          </header>

          <div className="w-full space-y-4">
            {formattedTime ? <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  {tooManyRequestsTranslate[lang].retrySuggestion.replace('{time}', formattedTime)}
                </p>
                <div className="mt-2 h-2 bg-blue-200 rounded-full">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{width: `${(1 / Number(retryAfter)) * 100}%`}}
                  />
                </div>
              </div> : null}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={pathname}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                aria-label={tooManyRequestsTranslate[lang].retryButton}
              >
                {tooManyRequestsTranslate[lang].retryButton}
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                aria-label={tooManyRequestsTranslate[lang].homeButton}
              >
                {tooManyRequestsTranslate[lang].homeButton}
              </Link>
            </div>
          </div>

          <footer className="pt-6 border-t border-gray-200 w-full">
            <p className="text-sm text-gray-500">
              {tooManyRequestsTranslate[lang].contactSupport(
                <a href="mailto:support@company.com" className="text-blue-600 hover:underline">
                  {process.env.COMPANY_MAIL}
                </a>,
              )}
            </p>
          </footer>
        </div>
      </article>
    </main>
  );
};

export default TooManyRequests;
