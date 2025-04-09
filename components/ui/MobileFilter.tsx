import React, {type FC} from 'react';
import {HiX} from 'react-icons/hi';

import {lang} from '@/app/lib/utilities/lang';
import {shopPageTranslate} from '@/public/locales/client/(public)/shop/shoppageTranslate';

type FiltersProps = {
  children: React.ReactNode;
  closeFilters: () => void;
};
const MobileFilter: FC<FiltersProps> = ({children, closeFilters}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{shopPageTranslate[lang].shopPage.content.filters}</h2>
          <button onClick={closeFilters} className="p-2 hover:bg-gray-100 rounded-full">
            <HiX className="text-2xl" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
};

export default MobileFilter;
