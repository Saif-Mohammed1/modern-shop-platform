import type {FC} from 'react';

import {lang} from '@/app/lib/utilities/lang';
import {rootStaticPagesTranslate} from '@/public/locales/client/(public)/rootStaticPagesTranslate';

type ErrorHandlerProps = {
  message?: string;
  reset?: () => void;
};
const ErrorHandler: FC<ErrorHandlerProps> = ({message, reset}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen mx-auto">
      <div className="bg-red-500 p-8 rounded-lg shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4">{rootStaticPagesTranslate[lang].error.title}</h2>
        <p className="text-lg mb-4">
          {message ? message : rootStaticPagesTranslate[lang].error.message.default}
        </p>
        {reset ? <button
            onClick={() => reset()}
            className="bg-white text-red-500 py-2 px-4 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {rootStaticPagesTranslate[lang].error.button.reset}
          </button> : null}
      </div>
    </div>
  );
};

export default ErrorHandler;
