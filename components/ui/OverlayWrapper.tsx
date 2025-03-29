"use client";

import { useRouter } from "next/navigation";

const OverlayWrapper = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const goBack = () => {
    // window.history.back();
    router.back();
  };
  return (
    // it showed take full width and height of the screen and be on top also it show have overlay color
    //  and item sh
    <div className="fixed inset-0 bg-black/60 #opacity-50 z-50 flex items-center justify-center #!-mt-2 h-screen ">
      <div className="rounded-lg relative ">
        <button
          onClick={goBack}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          ✖
        </button>

        {children}
      </div>
    </div>
  );
};

export default OverlayWrapper;
